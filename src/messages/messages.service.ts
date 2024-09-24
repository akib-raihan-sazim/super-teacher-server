import { Injectable, OnModuleInit } from "@nestjs/common";

import { io, Socket } from "socket.io-client";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Message } from "@/common/entities/messages.entity";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { UserRepository } from "@/users/users.repository";

import { CreateMessageDto } from "./messages.dtos";
import { ICreateMessageData } from "./messages.interfaces";
import { MessagesRepository } from "./messages.repository";

@Injectable()
export class MessagesService implements OnModuleInit {
  private socket!: Socket;

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly userRepository: UserRepository,
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly fileUploadsService: FileUploadsService,
  ) {}

  onModuleInit() {
    this.socket = io(`http://localhost:${process.env.BE_WS_PORT}`);
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Message> {
    const sender = await this.userRepository.findOneOrFail(userId);
    const classroom = await this.classroomsRepository.findOneOrFail(createMessageDto.classroomId);

    let attachmentUrl: string | undefined;
    if (file) {
      const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);
      const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);
      attachmentUrl = uploadResponse.url.split("?")[0];
    }

    const messageData: ICreateMessageData = {
      content: createMessageDto.content,
      attachmentUrl,
      sender,
      classroom,
    };

    const createdMessage = await this.messagesRepository.createOne(messageData);

    this.socket.emit("sendMessage", {
      id: createdMessage.id,
      content: createdMessage.content,
      attachmentUrl: attachmentUrl,
      classroomId: classroom.id,
      userId: sender.id,
    });

    return createdMessage;
  }

  async getMessagesByClassroom(classroomId: number): Promise<Message[]> {
    const classroom = await this.classroomsRepository.findOneOrFail(classroomId);
    return this.messagesRepository.find({ classroom }, { populate: ["sender"] });
  }

  async getMessageDownloadUrl(messageId: number): Promise<string> {
    const message = await this.messagesRepository.findOneOrFail(messageId);

    if (!message.attachmentUrl) {
      throw new Error("Message does not contain an attachment");
    }

    const fileKey = message.attachmentUrl.split("project-dev-bucket/")[1];

    const downloadUrl = await this.fileUploadsService.getDownloadUrl(fileKey);

    return downloadUrl;
  }
}
