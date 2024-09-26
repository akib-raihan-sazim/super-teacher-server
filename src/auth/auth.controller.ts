import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AuthResponseDto, LoginDto, RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { AuthService } from "./auth.service";

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

  @Post("reset-password/generate-otp")
  generateResetPasswordOtp(@Body("email") email: string): Promise<string> {
    return this.authService.generateResetPasswordOtp(email);
  }

  @Post("reset-password")
  resetPassword(
    @Body("email") email: string,
    @Body("otp") otpCode: string,
    @Body("newPassword") newPassword: string,
  ): Promise<boolean> {
    return this.authService.resetPassword(email, otpCode, newPassword);
  }
}
