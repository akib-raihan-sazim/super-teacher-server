import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserType } from "@/common/enums/users.enums";

import { AssignmentSubmissionsSerializer } from "./assignment_submissions.serializer";
import { AssignmentSubmissionsService } from "./assignment_submissions.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class AssignmentSubmissionsController {
  constructor(
    private readonly assignmentSubmissionsService: AssignmentSubmissionsService,
    private readonly assignmentSubmissionsSerializer: AssignmentSubmissionsSerializer,
  ) {}

  @Roles(EUserType.STUDENT)
  @Post(":classroomId/assignments/:assignmentId/submit-assignment")
  @UseInterceptors(FileInterceptor("file"))
  async submitAssignment(
    @CurrentUser() user: { id: number },
    @UploadedFile() file: Express.Multer.File,
    @Param("assignmentId") assignmentId: number,
  ) {
    const assignmentSubmission = await this.assignmentSubmissionsService.submitOne(
      file,
      assignmentId,
      user.id,
    );
    return this.assignmentSubmissionsSerializer.serialize(assignmentSubmission);
  }

  @Get(":classroomId/assignments/:assignmentId/submissions")
  async getSubmissionsForAssignment(@Param("assignmentId") assignmentId: number) {
    const submissions = await this.assignmentSubmissionsService.getSubmissionsByAssignmentId(
      assignmentId,
    );
    return this.assignmentSubmissionsSerializer.serializeMany(submissions);
  }

  @Delete(":classroomId/submissions/:submissionId")
  async deleteSubmission(@Param("submissionId") submissionId: number) {
    await this.assignmentSubmissionsService.deleteOne(submissionId);
    return { message: "Submission deleted successfully" };
  }

  @Get(":classroomId/assignments/:assignmentId/user/:userId/submission-status")
  async getSubmissionStatus(
    @Param("assignmentId") assignmentId: number,
    @Param("userId") userId: number,
  ) {
    const status = await this.assignmentSubmissionsService.getSubmissionStatus(
      assignmentId,
      userId,
    );
    return status;
  }

  @Get(":classroomId/submissions/:submissionId/download")
  getResourceDownloadUrl(@Param("submissionId") submissionId: number) {
    return this.assignmentSubmissionsService.getAssignmentSubmmissonDownloadUrl(submissionId);
  }
}
