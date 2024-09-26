import { Injectable, BadRequestException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import * as crypto from "crypto";

import { Otp } from "@/common/entities/otp.entity";

import { OtpRepository } from "./otp.repository";

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OtpRepository, private readonly em: EntityManager) {}

  private generateRandomOtp(): string {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  async generateOtp(email: string): Promise<string> {
    const existingOtp = await this.otpRepository.findOne({ email });

    if (existingOtp) {
      await this.em.removeAndFlush(existingOtp);
    }

    const otpCode = this.generateRandomOtp();
    const otp = new Otp();
    otp.email = email;
    otp.otp = otpCode;
    otp.expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await this.em.persistAndFlush(otp);
    return otpCode;
  }

  async validateOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({ email, otp: otpCode });

    if (!otp) {
      throw new BadRequestException("Invalid OTP");
    }

    if (otp.expiresAt < new Date()) {
      await this.em.removeAndFlush(otp);
      throw new BadRequestException("OTP has expired");
    }

    await this.em.removeAndFlush(otp);
    return true;
  }
}
