import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";

import { CreateAssignmentDto, UploadAssignmentDto } from "./assignments.dtos";
import { AssignmentsRepository } from "./assignments.repository";

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly classroomsRepository: ClassroomsRepository,
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

    return assignment;
  }

  async getAssignmentsByClassroomId(classroomId: number) {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });
    return this.assignmentsRepository.find({ classroom });
  }
}
