import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { AssignmentSubmission } from "@/common/entities/assignment-submissions.entity";
import { Assignment } from "@/common/entities/assignments.entity";
import { Student } from "@/common/entities/students.entity";
import { User } from "@/common/entities/users.entity";
import { FileUploadsModule } from "@/file-uploads/file-uploads.module";

import { AssignmentSubmissionsController } from "./assignment_submissions.controller";
import { AssignmentSubmissionsSerializer } from "./assignment_submissions.serializer";
import { AssignmentSubmissionsService } from "./assignment_submissions.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([AssignmentSubmission, Student, Assignment, User]),
    FileUploadsModule,
  ],
  controllers: [AssignmentSubmissionsController],
  providers: [AssignmentSubmissionsService, AssignmentSubmissionsSerializer],
})
export class AssignmentSubmissionsModule {}
