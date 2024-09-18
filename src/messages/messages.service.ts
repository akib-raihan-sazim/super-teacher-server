import { Injectable, OnModuleInit } from "@nestjs/common";

import { io, Socket } from "socket.io-client";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Message } from "@/common/entities/messages.entity";
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
  ) {}

  onModuleInit() {
    this.socket = io(`http://localhost:${process.env.BE_WS_PORT}`);
  }

  async createMessage(createMessageDto: CreateMessageDto, userId: number): Promise<Message> {
    const sender = await this.userRepository.findOneOrFail(userId);
    const classroom = await this.classroomsRepository.findOneOrFail(createMessageDto.classroomId);

    const messageData: ICreateMessageData = {
      content: createMessageDto.content,
      attachmentURL: createMessageDto.attachmentURL,
      sender,
      classroom,
    };

    const createdMessage = await this.messagesRepository.createOne(messageData);

    this.socket.emit("sendMessage", {
      content: createdMessage.content,
      classroomId: classroom.id,
      userId: sender.id,
    });

    return createdMessage;
  }

  async getMessagesByClassroom(classroomId: number): Promise<Message[]> {
    const classroom = await this.classroomsRepository.findOneOrFail(classroomId);
    return this.messagesRepository.find({ classroom }, { populate: ["sender"] });
  }
}
