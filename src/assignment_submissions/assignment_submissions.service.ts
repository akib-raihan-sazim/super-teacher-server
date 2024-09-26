import { Injectable } from "@nestjs/common";

import { AssignmentsRepository } from "@/assignments/assignments.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { StudentsRepository } from "@/students/students.repository";

import { CreateAssignmentSubmissionDto } from "./assignment_submissions.dtos";
import { AssignmentSubmissionsRepository } from "./assignment_submissions.repository";

@Injectable()
export class AssignmentSubmissionsService {
  constructor(
    private readonly assignmentSubmissionsRepository: AssignmentSubmissionsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async submitOne(
    file: Express.Multer.File,
    createAssignmentSubmissionDto: CreateAssignmentSubmissionDto,
  ) {
    const { assignmentId, userId } = createAssignmentSubmissionDto;

    const assignment = await this.assignmentsRepository.findOneOrFail(assignmentId);

    const student = await this.studentsRepository.findOneOrFail(
      { user: { id: userId } },
      { populate: ["user"] },
    );

    const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);
    const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    const fileUrl = uploadResponse.url.split("?")[0];

    const assignmentSubmission = await this.assignmentSubmissionsRepository.createOne({
      fileUrl,
      assignment,
      student,
    });

    return assignmentSubmission;
  }
}
