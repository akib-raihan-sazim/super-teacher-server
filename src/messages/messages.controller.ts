import { Body, Controller, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Message } from "@/common/entities/messages.entity";

import { CreateMessageDto } from "./messages.dtos";
import { MessagesSerializer } from "./messages.serializer";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesSerializer: MessagesSerializer,
  ) {}

  @Post()
  async createMessage(
    @CurrentUser() user: { id: number },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message: Message = await this.messagesService.createMessage(createMessageDto, user.id);

    return this.messagesSerializer.serialize(message);
  }
}
