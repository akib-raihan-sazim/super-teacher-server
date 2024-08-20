import { Controller, Post, Body } from "@nestjs/common";

import { RegisterStudentDto } from "./auth.dtos";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/student")
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    const user = await this.authService.registerStudent(registerStudentDto);

    const token = "token";
    return { user, token };
  }
}
