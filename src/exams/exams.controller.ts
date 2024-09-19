import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";

import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Exam } from "@/common/entities/exams.entity";
import { EUserType } from "@/common/enums/users.enums";

import { CreateExamDto } from "./exams.dtos";
import { ExamsSerializer } from "./exams.serializer";
import { ExamsService } from "./exams.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly examsSerializer: ExamsSerializer,
  ) {}

  @Post(":classroomId/exams")
  @Roles(EUserType.TEACHER)
  async createExam(
    @Param("classroomId") classroomId: number,
    @Body() createExamDto: CreateExamDto,
  ): Promise<Exam> {
    const exam = await this.examsService.createOne(classroomId, createExamDto);
    return this.examsSerializer.serialize(exam);
  }
}
