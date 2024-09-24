import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Message } from "@/common/entities/messages.entity";
import { User } from "@/common/entities/users.entity";
import { FileUploadsModule } from "@/file-uploads/file-uploads.module";
import { RealtimeMessagingModule } from "@/realtime-messaging/realtime-messaging.module";

import { ClassroomsModule } from "../classrooms/classrooms.module";
import { MessagesController } from "./messages.controller";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Message, User, Classroom]),
    ClassroomsModule,
    RealtimeMessagingModule,
    FileUploadsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesSerializer],
  exports: [MessagesService],
})
export class MessagesModule {}
