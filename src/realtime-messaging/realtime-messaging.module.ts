import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { User } from "@/common/entities/users.entity";

import { RealtimeMessagingGateway } from "./realtime-messaging.gateway";

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [RealtimeMessagingGateway],
  exports: [RealtimeMessagingGateway],
})
export class RealtimeMessagingModule {}
