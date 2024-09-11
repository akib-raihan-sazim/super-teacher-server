import { Controller, Get, Param, UseGuards } from "@nestjs/common";

import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Student } from "@/common/entities/students.entity";
import { EUserType } from "@/common/enums/users.enums";

import { StudentSerializer } from "./students.serializer";
import { StudentsService } from "./students.service";

@Controller("students")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly studentSerializer: StudentSerializer,
  ) {}

  @Get("unenrolled/:classroomId")
  @Roles(EUserType.TEACHER)
  async getUnenrolledStudents(@Param("classroomId") classroomId: number): Promise<Student[]> {
    const students = await this.studentsService.getUnenrolledStudents(classroomId);
    return this.studentSerializer.serializeMany(students);
  }
}
