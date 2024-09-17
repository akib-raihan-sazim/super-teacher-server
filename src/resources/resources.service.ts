import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { CreateResourceDto } from "@/resources/resources.dtos";
import { ResourcesRepository } from "@/resources/resources.repository";

@Injectable()
export class ResourcesService {
  constructor(
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly resourcesRepository: ResourcesRepository,
  ) {}

  async uploadResource(
    file: Express.Multer.File,
    classroomId: number,
    title: string,
    description: string,
  ) {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);

    const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    const createResourceDto: CreateResourceDto = {
      title,
      description,
      fileUrl: presignedUrl.split("?")[0],
      classroom,
    };

    const resource = await this.resourcesRepository.createOne(createResourceDto);

    return resource;
  }
}
