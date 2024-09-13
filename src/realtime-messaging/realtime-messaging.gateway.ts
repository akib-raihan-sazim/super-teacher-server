import { Injectable } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { EntityManager } from "@mikro-orm/core";

import { Server, Socket } from "socket.io";

import { User } from "@/common/entities/users.entity";

import { IMessagePayload } from "./realtime-message.interface";

@Injectable()
@WebSocketGateway(Number(process.env.BE_WS_PORT), {
  cors: {
    origin: "*",
  },
})
export class RealtimeMessagingGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly em: EntityManager) {}

  @SubscribeMessage("sendMessage")
  async handleMessage(client: Socket, payload: IMessagePayload) {
    const em = this.em.fork();
    const { classroomId, content, userId } = payload;
    const sender = (await em.getRepository(User).findOne(userId)) as User | null;

    if (!sender) {
      client.emit("error", "User not found");
      return;
    }

    this.server.to(`classroom-${classroomId}`).emit("receiveMessage", {
      content,
      sender,
      classroomId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage("joinClassroom")
  handleJoinClassroom(client: Socket, payload: { classroomId: number; userId: number }) {
    const { classroomId } = payload;
    client.join(`classroom-${classroomId}`);
  }

  @SubscribeMessage("leaveClassroom")
  handleLeaveClassroom(client: Socket, payload: { classroomId: number; userId: number }) {
    const { classroomId } = payload;
    client.leave(`classroom-${classroomId}`);
  }
}
