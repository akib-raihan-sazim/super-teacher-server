import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Assignment } from "@/common/entities/assignments.entity";
import { EnrollmentsRepository } from "@/enrollments/enrollments.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { MailService } from "@/mail/mail.service";

import { CreateAssignmentDto, UpdateAssignmentDto, UploadAssignmentDto } from "./assignments.dtos";
import { AssignmentsRepository } from "./assignments.repository";

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly mailService: MailService,
    private readonly enrolllmentsRepository: EnrollmentsRepository,
  ) {}

  async uploadOne(
    file: Express.Multer.File,
    classroomId: number,
    uploadAssignmentDto: UploadAssignmentDto,
  ) {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);
    const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    const createAssignmentDto: CreateAssignmentDto = {
      ...uploadAssignmentDto,
      fileUrl: uploadResponse.url.split("?")[0],
      classroom,
    };

    const assignment = await this.assignmentsRepository.createOne(createAssignmentDto);

    const enrollments = await this.enrolllmentsRepository.find(
      { classroom: classroom },
      { populate: ["student", "student.user"] },
    );

    for (const enrollment of enrollments) {
      const { email } = enrollment.student.user;

      await this.mailService.sendEmail(
        email,
        `New Assignment: ${uploadAssignmentDto.title}`,
        `An assignment has been posted for ${
          classroom.title
        }. Due date: ${uploadAssignmentDto.dueDate.toLocaleDateString()}.`,
      );
    }

    return assignment;
  }

  async getAssignmentsByClassroomId(classroomId: number): Promise<Assignment[]> {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });
    const assignments = await this.assignmentsRepository.find(
      { classroom },
      { populate: ["classroom"] },
    );
    return assignments;
  }

  async updateOne(
    assignmentId: number,
    updateAssignmentDto: UpdateAssignmentDto,
    file?: Express.Multer.File,
  ): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOneOrFail(assignmentId);
    if (file) {
      const oldFileKey = assignment.fileUrl.split("project-dev-bucket/")[1];
      await this.fileUploadsService.deleteFromS3(oldFileKey);
      const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);
      const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }
      updateAssignmentDto.fileUrl = uploadResponse.url.split("?")[0];
    }

    this.assignmentsRepository.updateOne(assignment, updateAssignmentDto);
    return assignment;
  }

  async deleteOne(assignmentId: number): Promise<void> {
    const assignment = await this.assignmentsRepository.findOneOrFail(assignmentId);

    const fileKey = assignment.fileUrl.split("project-dev-bucket/")[1];

    await this.fileUploadsService.deleteFromS3(fileKey);

    await this.assignmentsRepository.deleteOne(assignment);
  }

  async getAssignmentDownloadUrl(assignmentId: number) {
    const resource = await this.assignmentsRepository.findOneOrFail(assignmentId);

    const fileKey = resource.fileUrl.split("project-dev-bucket/")[1];

    const downloadUrl = await this.fileUploadsService.getDownloadUrl(fileKey);

    return downloadUrl;
  }
}
