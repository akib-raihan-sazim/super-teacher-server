import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { CreateResourceDto, UpdateResourceDto } from "@/resources/resources.dtos";
import { ResourcesRepository } from "@/resources/resources.repository";

@Injectable()
export class ResourcesService {
  constructor(
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly fileUploadsService: FileUploadsService,
    private readonly resourcesRepository: ResourcesRepository,
  ) {}

  async uploadOne(
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

  async getClassroomResources(classroomId: number) {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    return this.resourcesRepository.find({ classroom: classroom });
  }

  async deleteOne(resourceId: number) {
    const resource = await this.resourcesRepository.findOneOrFail(resourceId);

    const fileKey = resource.fileUrl.split("project-dev-bucket/")[1];

    await this.fileUploadsService.deleteFromS3(fileKey);

    await this.resourcesRepository.deleteOne(resource);

    return { message: "Resource deleted successfully" };
  }

  async updateOne(
    resourceId: number,
    updateResourceDto: UpdateResourceDto,
    file?: Express.Multer.File,
  ) {
    const resource = await this.resourcesRepository.findOneOrFail(resourceId);
    if (file) {
      const oldFileKey = resource.fileUrl.split("project-dev-bucket/")[1];
      await this.fileUploadsService.deleteFromS3(oldFileKey);
      const presignedUrl = await this.fileUploadsService.getPresignedUrl(file);
      const uploadResponse = await this.fileUploadsService.uploadToS3(presignedUrl, file);
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }
      updateResourceDto.fileUrl = presignedUrl.split("?")[0];
    }

    await this.resourcesRepository.updateOne(resource, updateResourceDto);
    return resource;
  }
}
