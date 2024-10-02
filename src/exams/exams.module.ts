import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Enrollment } from "@/common/entities/enrollments.entity";
import { Exam } from "@/common/entities/exams.entity";
import { MailModule } from "@/mail/mail.module";

import { ExamsController } from "./exams.controller";
import { ExamsSerializer } from "./exams.serializer";
import { ExamsService } from "./exams.service";

@Module({
  imports: [MikroOrmModule.forFeature([Exam, Classroom, Enrollment]), MailModule],
  controllers: [ExamsController],
  providers: [ExamsService, ExamsSerializer],
})
export class ExamsModule {}
