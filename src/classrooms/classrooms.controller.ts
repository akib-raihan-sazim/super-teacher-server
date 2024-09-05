import { Body, Controller, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard"; // Import the new RolesGuard
import { EUserType } from "@/common/enums/users.enums";

import { ClassroomResponseDto, CreateClassroomDto } from "./classrooms.dtos";
import { ClassroomsService } from "./classrooms.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classrooms")
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @Roles(EUserType.TEACHER)
  createClassroom(
    @CurrentUser() user: { id: number },
    @Body() createClassroomDto: CreateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    return this.classroomsService.createClassroom(createClassroomDto, user.id);
  }
}
