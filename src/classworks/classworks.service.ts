import { Injectable } from "@nestjs/common";

import { randomUUID } from "crypto";
import * as path from "path";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { FileUploadsService } from "@/file-uploads/file-uploads.service";
import { CreateResourceDto } from "@/resources/resources.dtos";
import { ResourcesRepository } from "@/resources/resources.repository";

@Injectable()
export class ClassworksService {
  constructor(
    private readonly fileUploadsService: FileUploadsService,
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly resourcesRepository: ResourcesRepository,
  ) {}

  async uploadResource(file: Express.Multer.File, classroomId: number, title: string) {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${title.replace(/\s+/g, "_")}_${randomUUID()}${fileExtension}`;

    const fileUrl = await this.fileUploadsService.uploadFile(file, uniqueFilename);

    const createResourceDto: CreateResourceDto = {
      title: title,
      fileUrl: fileUrl,
      classroom: classroom,
    };

    const resource = await this.resourcesRepository.createOne(createResourceDto);
    return resource;
  }
}
