import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Enrollment } from "@/common/entities/enrollments.entity";
import { Resources } from "@/common/entities/resources.entity";
import { FileUploadsModule } from "@/file-uploads/file-uploads.module";
import { MailModule } from "@/mail/mail.module";

import { ResourcesController } from "./resources.controller";
import { ResourcesService } from "./resources.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Resources, Classroom, Enrollment]),
    FileUploadsModule,
    MailModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
