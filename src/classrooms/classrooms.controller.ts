import { Body, Controller, Post, UseGuards, Get, Param, Delete, Put } from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserType } from "@/common/enums/users.enums";
import { CreateEnrollmentDto } from "@/enrollments/enrollments.dtos";
import { IEnrollment } from "@/enrollments/enrollments.interface";
import { EnrollmentSerializer } from "@/enrollments/enrollments.serializer";
import { EnrollmentsService } from "@/enrollments/enrollments.service";

import { ClassroomResponseDto, CreateClassroomDto, UpdateClassroomDto } from "./classrooms.dtos";
import { ClassroomsSerializer } from "./classrooms.serializer";
import { ClassroomsService } from "./classrooms.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class ClassroomsController {
  constructor(
    private readonly classroomsService: ClassroomsService,
    private readonly classroomsSerializer: ClassroomsSerializer,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly enrollmentSerializer: EnrollmentSerializer,
  ) {}

  @Post()
  @Roles(EUserType.TEACHER)
  createClassroom(
    @CurrentUser() user: { id: number },
    @Body() createClassroomDto: CreateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    return this.classroomsService.createClassroom(createClassroomDto, user.id);
  }

  @Get()
  async getClassrooms(@CurrentUser() user: { id: number }): Promise<ClassroomResponseDto[]> {
    const classrooms = await this.classroomsService.getClassroomsForUser(user.id);
    return this.classroomsSerializer.serializeMany(classrooms);
  }

  @Get(":id")
  async getClassroomById(
    @Param("id") id: number,

    @CurrentUser() user: { id: number },
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomsService.getClassroomById(id, user.id);
    return this.classroomsSerializer.serialize(classroom);
  }

  @Delete(":id")
  @Roles(EUserType.TEACHER)
  async deleteClassroom(
    @Param("id") id: number,
    @CurrentUser() user: { id: number },
  ): Promise<boolean> {
    const result = await this.classroomsService.deleteClassroom(id, user.id);
    return result;
  }

  @Put(":id")
  @Roles(EUserType.TEACHER)
  async updateClassroom(
    @Param("id") id: number,
    @CurrentUser() user: { id: number },
    @Body() updateClassroomDto: UpdateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomsService.updateClassroom(id, updateClassroomDto, user.id);
    return this.classroomsSerializer.serialize(classroom);
  }

  @Post(":id/enroll")
  @Roles(EUserType.TEACHER)
  enrollStudent(
    @Param("id") classroomId: number,
    @Body() enrollmentDto: { studentId: number },
  ): Promise<boolean> {
    const createEnrollmentDto: CreateEnrollmentDto = {
      studentId: enrollmentDto.studentId,
      classroomId: classroomId,
    };
    return this.enrollmentsService.enrollStudent(createEnrollmentDto);
  }

  @Delete(":id/unenroll")
  @Roles(EUserType.TEACHER)
  unenrollStudent(
    @Param("id") classroomId: number,
    @CurrentUser() user: { id: number },
    @Body() unenrollDto: { studentId: number },
  ): Promise<void> {
    const deleteEnrollDto: CreateEnrollmentDto = {
      studentId: unenrollDto.studentId,
      classroomId: classroomId,
    };
    return this.enrollmentsService.removeStudent(user.id, deleteEnrollDto);
  }

  @Get(":id/students")
  async getStudentsForClassroom(@Param("id") classroomId: number): Promise<IEnrollment[]> {
    const enrollments = await this.enrollmentsService.getStudentsForClassroom(classroomId);
    return this.enrollmentSerializer.serializeMany(enrollments);
  }
}
