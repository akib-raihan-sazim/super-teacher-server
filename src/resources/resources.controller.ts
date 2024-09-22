import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Delete,
  Put,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { UpdateResourceDto } from "./resources.dtos";
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
    return this.resourcesService.uploadOne(file, classroomId, title, description);
  }

  @Get(":classroomId/resources")
  getClassroomResources(@Param("classroomId") classroomId: number) {
    return this.resourcesService.getClassroomResources(classroomId);
  }

  @Delete(":classroomId/resources/:resourceId")
  async deleteResource(@Param("resourceId") resourceId: number) {
    await this.resourcesService.deleteOne(resourceId);
  }

  @Put(":classroomId/resources/:resourceId")
  @UseInterceptors(FileInterceptor("file"))
  updateResource(
    @Param("resourceId") resourceId: number,
    @Body() updateResourceDto: UpdateResourceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.updateOne(resourceId, updateResourceDto, file);
  }
}
