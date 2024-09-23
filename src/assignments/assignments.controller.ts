import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Put,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { Assignment } from "@/common/entities/assignments.entity";

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
  async getAssignments(@Param("classroomId") classroomId: number): Promise<Assignment[]> {
    const assignments = await this.assignmentsService.getAssignmentsByClassroomId(classroomId);
    return this.assignmentsSerializer.serializeMany(assignments);
  }

  @Put("assignments/:assignmentId")
  @UseInterceptors(FileInterceptor("file"))
  async editAssignment(
    @Param("assignmentId") assignmentId: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Assignment> {
    const assignment = await this.assignmentsService.updateOne(
      assignmentId,
      updateAssignmentDto,
      file,
    );
    return this.assignmentsSerializer.serialize(assignment);
  }

  @Delete("assignments/:assignmentId")
  async deleteAssignment(@Param("assignmentId") assignmentId: number) {
    await this.assignmentsService.deleteOne(assignmentId);
    return { message: "Assignment deleted successfully" };
  }
}
