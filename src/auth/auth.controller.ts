import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AuthResponseDto, LoginDto, RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { ITokenizedUser } from "./auth.interfaces";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/student")
  registerStudent(@Body() registerStudentDto: RegisterStudentDto): Promise<AuthResponseDto> {
    return this.authService.registerStudent(registerStudentDto);
  }

  @Post("register/teacher")
  registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto): Promise<AuthResponseDto> {
    return this.authService.registerTeacher(registerTeacherDto);
  }

  @UseGuards(AuthGuard("local"))
  @Post("login")
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: ITokenizedUser): ITokenizedUser {
    return user;
  }
}
