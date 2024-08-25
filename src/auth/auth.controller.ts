import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { LoginDto, RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/student")
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    const { user, token } = await this.authService.registerStudent(registerStudentDto);
    return { user, token };
  }

  @Post("register/teacher")
  async registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto) {
    const { user, token } = await this.authService.registerTeacher(registerTeacherDto);
    return { user, token };
  }

  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    const { user, token } = await this.authService.login(loginDto);
    return { user, token };
  }
}
