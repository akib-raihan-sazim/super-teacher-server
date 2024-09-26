import { Controller, Post, Body } from "@nestjs/common";

import { OtpService } from "./otp.service";

@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("generate")
  generateOtp(@Body("email") email: string): Promise<string> {
    return this.otpService.generateOtp(email);
  }

  @Post("validate")
  validateOtp(@Body("email") email: string, @Body("otp") otp: string): Promise<boolean> {
    return this.otpService.validateOtp(email, otp);
  }
}
