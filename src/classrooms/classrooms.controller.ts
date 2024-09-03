import { Body, Controller, Post, UseGuards, Get, Param, Delete } from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserType } from "@/common/enums/users.enums";

import { ClassroomResponseDto, CreateClassroomDto } from "./classrooms.dtos";
import { ClassroomsSerializer } from "./classrooms.serializer";
import { ClassroomsService } from "./classrooms.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class ClassroomsController {
  constructor(
    private readonly classroomsService: ClassroomsService,
    private readonly classroomsSerializer: ClassroomsSerializer,
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
}
