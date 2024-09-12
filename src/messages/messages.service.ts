import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Message } from "@/common/entities/messages.entity";
import { UserRepository } from "@/users/users.repository";

import { CreateMessageDto } from "./messages.dtos";
import { ICreateMessageData } from "./messages.interfaces";
import { MessagesRepository } from "./messages.repository";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly userRepository: UserRepository,
    private readonly classroomsRepository: ClassroomsRepository,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: number): Promise<Message> {
    const sender = await this.userRepository.findOneOrFail(userId);

    const classroom = await this.classroomsRepository.findOneOrFail(createMessageDto.classroomId);

    const messageData: ICreateMessageData = {
      content: createMessageDto.content,
      attachmentURL: createMessageDto.attachmentURL,
      sender,
      classroom,
    };

    return this.messagesRepository.createOne(messageData);
  }

  async getMessagesByClassroom(classroomId: number): Promise<Message[]> {
    const classroom = await this.classroomsRepository.findOneOrFail(classroomId);
    return this.messagesRepository.find({ classroom });
  }
}
