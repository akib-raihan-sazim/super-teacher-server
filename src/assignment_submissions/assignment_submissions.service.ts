import { Injectable } from "@nestjs/common";

import { AssignmentsRepository } from "@/assignments/assignments.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { StudentsRepository } from "@/students/students.repository";

import { AssignmentSubmissionsRepository } from "./assignment_submissions.repository";

@Injectable()
export class AssignmentSubmissionsService {
  constructor(
    private readonly assignmentSubmissionsRepository: AssignmentSubmissionsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async submitOne(file: Express.Multer.File, assignmentId: number, userId: number) {
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

  async getSubmissionsByAssignmentId(assignmentId: number) {
    const assignment = await this.assignmentsRepository.findOneOrFail(assignmentId);

    const submissions = await this.assignmentSubmissionsRepository.find(
      { assignment },
      { populate: ["student", "student.user"] },
    );

    return submissions;
  }

  async deleteOne(submissionId: number): Promise<void> {
    const submission = await this.assignmentSubmissionsRepository.findOneOrFail(submissionId);

    const fileKey = submission.fileUrl.split("project-dev-bucket/")[1];
    await this.fileUploadsService.deleteFromS3(fileKey);

    await this.assignmentSubmissionsRepository.deleteOne(submission);
  }

  async getSubmissionStatus(
    assignmentId: number,
    userId: number,
  ): Promise<{ submitted: boolean; submissionId?: number }> {
    const assignment = await this.assignmentsRepository.findOneOrFail(assignmentId);
    const student = await this.studentsRepository.findOneOrFail({ user: { id: userId } });

    const submission = await this.assignmentSubmissionsRepository.findOne({
      assignment,
      student,
    });

    if (submission) {
      return { submitted: true, submissionId: submission.id };
    } else {
      return { submitted: false };
    }
  }

  async getAssignmentSubmmissonDownloadUrl(submissionId: number) {
    const resource = await this.assignmentSubmissionsRepository.findOneOrFail(submissionId);

    const fileKey = resource.fileUrl.split("project-dev-bucket/")[1];

    const downloadUrl = await this.fileUploadsService.getDownloadUrl(fileKey);

    return downloadUrl;
  }
}
