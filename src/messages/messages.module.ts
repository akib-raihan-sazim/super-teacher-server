import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Message } from "@/common/entities/messages.entity";
import { User } from "@/common/entities/users.entity";

import { ClassroomsModule } from "../classrooms/classrooms.module";
import { MessagesController } from "./messages.controller";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@Module({
  imports: [MikroOrmModule.forFeature([Message, User, Classroom]), ClassroomsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesSerializer],
  exports: [MessagesService],
})
export class MessagesModule {}
