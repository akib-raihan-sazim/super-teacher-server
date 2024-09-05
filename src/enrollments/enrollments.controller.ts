import { Controller, Post, Body, UseGuards, Delete, Get, Param } from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserType } from "@/common/enums/users.enums";

import { CreateEnrollmentDto, EnrollmentResponseDto } from "./enrollments.dtos";
import { IEnrollment } from "./enrollments.interface";
import { EnrollmentSerializer } from "./enrollments.serializer";
import { EnrollmentsService } from "./enrollments.service";

@Controller("enrollments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly enrollmentSerializer: EnrollmentSerializer,
  ) {}

  @Roles(EUserType.TEACHER)
  @Post()
  enrollStudent(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.enrollStudent(createEnrollmentDto);
  }

  @Roles(EUserType.TEACHER)
  @Delete()
  unenrollStudent(
    @CurrentUser() user: { id: number },
    @Body() deleteEnrollDto: CreateEnrollmentDto,
  ): Promise<void> {
    return this.enrollmentsService.removeStudent(user.id, deleteEnrollDto);
  }

  @Roles(EUserType.TEACHER)
  @Get("students/:classroomId")
  async getStudentsForClassroom(@Param("classroomId") classroomId: number): Promise<IEnrollment[]> {
    const enrollments = await this.enrollmentsService.getStudentsForClassroom(classroomId);
    return this.enrollmentSerializer.serializeMany(enrollments);
  }
}
