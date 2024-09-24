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
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Assignment } from "@/common/entities/assignments.entity";
import { EUserType } from "@/common/enums/users.enums";

import { UpdateAssignmentDto, UploadAssignmentDto } from "./assignments.dtos";
import { AssignmentsSerializer } from "./assignments.serializer";
import { AssignmentsService } from "./assignments.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly assignmentsSerializer: AssignmentsSerializer,
  ) {}

  @Roles(EUserType.TEACHER)
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

  @Roles(EUserType.TEACHER)
  @Put(":classroomId/assignments/:assignmentId")
  @UseInterceptors(FileInterceptor("file"))
  async editAssignment(
    @Param("classroomId") classroomId: number,
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

  @Roles(EUserType.TEACHER)
  @Delete(":classroomId/assignments/:assignmentId")
  async deleteAssignment(
    @Param("classroomId") classroomId: number,
    @Param("assignmentId") assignmentId: number,
  ) {
    await this.assignmentsService.deleteOne(assignmentId);
    return { message: "Assignment deleted successfully" };
  }

  @Get(":classroomId/assignments/:assignmentId/download")
  getResourceDownloadUrl(@Param("assignmentId") assignmentId: number) {
    return this.assignmentsService.getAssignmentDownloadUrl(assignmentId);
  }
}
