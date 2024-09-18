import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Message } from "@/common/entities/messages.entity";

@Injectable()
export class MessagesRepository extends EntityRepository<Message> {}
