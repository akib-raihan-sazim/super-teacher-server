import { Controller, Post, Body } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UniqueCodeService } from "../unique-code/unique-code.service";
import { RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly configService: ConfigService,
  ) {}

  @Post("register/student")
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    const user = await this.authService.registerStudent(registerStudentDto);

    const token = "token";
    return { user, token };
  }

  @Post("register/teacher")
  async registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto) {
    const user = await this.authService.registerTeacher(registerTeacherDto);
    return {
      message: "Teacher registered successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
