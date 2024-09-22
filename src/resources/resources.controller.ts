import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { ResourcesService } from "./resources.service";

@Controller("classrooms")
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post(":classroomId/resources")
  @UseInterceptors(FileInterceptor("file"))
  createResource(
    @UploadedFile() file: Express.Multer.File,
    @Param("classroomId") classroomId: number,
    @Body("title") title: string,
    @Body("description") description: string,
  ) {
    return this.resourcesService.uploadResource(file, classroomId, title, description);
  }

  @Get(":classroomId/resources")
  getClassroomResources(@Param("classroomId") classroomId: number) {
    return this.resourcesService.getClassroomResources(classroomId);
  }

  @Delete(":classroomId/resources/:resourceId")
  async deleteResource(@Param("resourceId") resourceId: number) {
    await this.resourcesService.deleteResource(resourceId);
  }
}
