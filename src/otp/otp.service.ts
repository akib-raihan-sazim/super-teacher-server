import { Injectable, BadRequestException } from "@nestjs/common";

import * as crypto from "crypto";

import { Otp } from "@/common/entities/otp.entity";

import { OtpRepository } from "./otp.repository";

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OtpRepository) {}

  private generateRandomOtp(): string {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  async generateOtp(email: string): Promise<string> {
    const otpCode = this.generateRandomOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let otp = await this.otpRepository.findOne({ email });

    if (otp) {
      otp.otp = otpCode;
      otp.expiresAt = expiresAt;
    } else {
      otp = new Otp();
      otp.email = email;
      otp.otp = otpCode;
      otp.expiresAt = expiresAt;
    }

    await this.otpRepository.updateOne(otp);

    return otpCode;
  }

  async validateOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpRepository.findOneOrFail({ email, otp: otpCode });

    if (otp.expiresAt < new Date()) {
      await this.otpRepository.removeOne(otp);
      throw new BadRequestException("OTP has expired");
    }

    await this.otpRepository.removeOne(otp);
    return true;
  }
}
