import { Message } from "@/common/entities/messages.entity";

export interface ICreateMessageData {
  content: string;
  attachmentURL?: string;
  sender: Message["sender"];
  classroom: Message["classroom"];
}
