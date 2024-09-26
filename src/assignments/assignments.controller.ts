import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Put,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { UpdateAssignmentDto, UploadAssignmentDto } from "./assignments.dtos";
import { AssignmentsSerializer } from "./assignments.serializer";
import { AssignmentsService } from "./assignments.service";

@Controller("classrooms")
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly assignmentsSerializer: AssignmentsSerializer,
  ) {}

  @Post(":classroomId/assignments")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAssignment(
    @UploadedFile() file: Express.Multer.File,
    @Param("classroomId") classroomId: number,
    @Body() uploadAssignmentDto: UploadAssignmentDto,
  ) {
    const assignment = await this.assignmentsService.uploadOne(
      file,
      classroomId,
      uploadAssignmentDto,
    );
    return this.assignmentsSerializer.serialize(assignment);
  }

  @Get(":classroomId/assignments")
  getAssignments(@Param("classroomId") classroomId: number) {
    return this.assignmentsService.getAssignmentsByClassroomId(classroomId);
  }

  @Put(":classroomId/assignments/:assignmentId")
  @UseInterceptors(FileInterceptor("file"))
  editAssignment(
    @Param("assignmentId") assignmentId: number,
    @Param("classroomId") classroomId: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentsService.updateAssignment(assignmentId, updateAssignmentDto, file);
  }
}
