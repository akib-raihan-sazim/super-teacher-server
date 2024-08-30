import { Body, Controller, Post, UseGuards, Get } from "@nestjs/common";

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
}
