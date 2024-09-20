import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Assignment } from "@/common/entities/assignments.entity";
import { Classroom } from "@/common/entities/classrooms.entity";
import { FileUploadsModule } from "@/file-uploads/file-uploads.module";

import { AssignmentsController } from "./assignments.controller";
import { AssignmentsSerializer } from "./assignments.serializer";
import { AssignmentsService } from "./assignments.service";

@Module({
  imports: [MikroOrmModule.forFeature([Assignment, Classroom]), FileUploadsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsSerializer],
})
export class AssignmentsModule {}
