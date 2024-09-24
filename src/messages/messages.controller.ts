import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

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
  @UseInterceptors(FileInterceptor("file"))
  async createMessage(
    @CurrentUser() user: { id: number },
    @UploadedFile() file: Express.Multer.File,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message: Message = await this.messagesService.createMessage(
      createMessageDto,
      user.id,
      file,
    );
    return this.messagesSerializer.serialize(message);
  }

  @Get("classroom/:classroomId/messages")
  async getMessagesForClassroom(@Param("classroomId") classroomId: number) {
    const messages = await this.messagesService.getMessagesByClassroom(classroomId);
    return this.messagesSerializer.serializeMany(messages);
  }

  @Get(":classroomId/messages/:messageId/download")
  getResourceDownloadUrl(@Param("messageId") messageId: number) {
    return this.messagesService.getMessageDownloadUrl(messageId);
  }
}
