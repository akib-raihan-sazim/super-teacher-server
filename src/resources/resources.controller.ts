import { Controller, Post, UseInterceptors, UploadedFile, Param, Body, Get } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { ResourcesService } from "./resources.service";

@Controller("classrooms")
export class ResourcesController {
  constructor(private readonly classworksService: ResourcesService) {}

  @Post(":classroomId/resources")
  @UseInterceptors(FileInterceptor("file"))
  createResource(
    @UploadedFile() file: Express.Multer.File,
    @Param("classroomId") classroomId: number,
    @Body("title") title: string,
    @Body("description") description: string,
  ) {
    return this.classworksService.uploadResource(file, classroomId, title, description);
  }

  @Get(":classroomId/resources")
  getClassroomResources(@Param("classroomId") classroomId: number) {
    return this.classworksService.getClassroomResources(classroomId);
  }
}
