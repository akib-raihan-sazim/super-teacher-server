import { Controller, Post, Body, UseGuards } from "@nestjs/common";

import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EUserType } from "@/common/enums/users.enums";

import { CreateEnrollmentDto } from "./enrollments.dtos";
import { EnrollmentsService } from "./enrollments.service";

@Controller("enrollments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(EUserType.TEACHER)
  @Post()
  enrollStudent(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<boolean> {
    return this.enrollmentsService.enrollStudent(createEnrollmentDto);
  }
}
