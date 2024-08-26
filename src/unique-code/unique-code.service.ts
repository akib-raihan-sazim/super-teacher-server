import { Injectable, BadRequestException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { UniqueCodeRepository } from "./unique-code.repository";

@Injectable()
export class UniqueCodeService {
  constructor(private readonly uniqueCodeRepository: UniqueCodeRepository) {}

  async generateUniqueCode(email: string, em: EntityManager): Promise<string> {
    const existingCode = await this.uniqueCodeRepository.findByEmail(email, em);
    if (existingCode) {
      throw new BadRequestException(
        `Unique code already exists for this email and usage: ${existingCode.usageCount}`,
      );
    }

    const code = this.generateRandomCode();
    await this.uniqueCodeRepository.create(email, code, em);
    return code;
  }

  async validateAndIncrementUniqueCode(
    email: string,
    code: string,
    em: EntityManager,
  ): Promise<void> {
    const uniqueCode = await this.uniqueCodeRepository.findByCode(code, em);
    if (!uniqueCode) {
      throw new BadRequestException("Invalid unique code");
    }

    if (uniqueCode.usageCount >= 3) {
      await this.uniqueCodeRepository.delete(uniqueCode, em);
      throw new BadRequestException(
        "Unique code has exceeded maximum usage limit and has been deleted",
      );
    }

    await this.uniqueCodeRepository.incrementUsageCount(uniqueCode, em);

    if (uniqueCode.email !== email) {
      throw new BadRequestException("Unique code does not match the provided email");
    }
  }

  private generateRandomCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
