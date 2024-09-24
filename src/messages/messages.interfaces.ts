import { Message } from "@/common/entities/messages.entity";

export interface ICreateMessageData {
  content: string;
  attachmentUrl?: string;
  sender: Message["sender"];
  classroom: Message["classroom"];
}
