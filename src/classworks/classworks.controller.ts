import { Controller, Post, UseInterceptors, UploadedFile, Param, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { ClassworksService } from "./classworks.service";

@Controller("classworks")
export class ClassworksController {
  constructor(private readonly classworksService: ClassworksService) {}

  @Post(":classroomId/resources")
  @UseInterceptors(FileInterceptor("file"))
  uploadResource(
    @UploadedFile() file: Express.Multer.File,
    @Param("classroomId") classroomId: number,
    @Body("title") title: string,
  ) {
    return this.classworksService.uploadResource(file, classroomId, title);
  }
}
