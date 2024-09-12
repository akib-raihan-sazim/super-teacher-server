import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Message } from "@/common/entities/messages.entity";

import { ICreateMessageData } from "./messages.interfaces";

@Injectable()
export class MessagesRepository extends EntityRepository<Message> {
  async createOne(messageData: ICreateMessageData): Promise<Message> {
    const message = this.create(messageData);
    await this.em.persistAndFlush(message);
    return message;
  }
}
