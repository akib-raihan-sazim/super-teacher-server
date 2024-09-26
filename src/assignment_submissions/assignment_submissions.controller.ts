import { Controller, Post, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { CreateAssignmentSubmissionDto } from "./assignment_submissions.dtos";
import { AssignmentSubmissionsSerializer } from "./assignment_submissions.serializer";
import { AssignmentSubmissionsService } from "./assignment_submissions.service";

@Controller("classrooms")
export class AssignmentSubmissionsController {
  constructor(
    private readonly assignmentSubmissionsService: AssignmentSubmissionsService,
    private readonly assignmentSubmissionsSerializer: AssignmentSubmissionsSerializer,
  ) {}

  @Post("submit-assignment")
  @UseInterceptors(FileInterceptor("file"))
  async submitAssignment(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAssignmentSubmissionDto: CreateAssignmentSubmissionDto,
  ) {
    const assignmentSubmission = await this.assignmentSubmissionsService.submitOne(
      file,
      createAssignmentSubmissionDto,
    );
    return this.assignmentSubmissionsSerializer.serialize(assignmentSubmission);
  }
}
