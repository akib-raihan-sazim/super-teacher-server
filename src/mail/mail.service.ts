import { MailerService } from "@nestjs-modules/mailer/dist";
import { Injectable } from "@nestjs/common";

import { SentMessageInfo } from "nodemailer";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(receiverEmail: string, subject: string, text: string): Promise<SentMessageInfo> {
    const sentMessageInfo = await this.mailerService.sendMail({
      to: receiverEmail,
      subject: subject,
      text: text,
    });
    return sentMessageInfo;
  }
}
