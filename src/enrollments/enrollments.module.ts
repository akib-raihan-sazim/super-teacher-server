import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Enrollment } from "@/common/entities/enrollments.entity";
import { Student } from "@/common/entities/students.entity";
import { User } from "@/common/entities/users.entity";
import { MailModule } from "@/mail/mail.module";

import { EnrollmentsController } from "./enrollments.controller";
import { EnrollmentSerializer } from "./enrollments.serializer";
import { EnrollmentsService } from "./enrollments.service";

@Module({
  imports: [MikroOrmModule.forFeature([Classroom, Student, Enrollment, User]), MailModule],
  providers: [EnrollmentsService, EnrollmentSerializer],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService, EnrollmentSerializer],
})
export class EnrollmentsModule {}
