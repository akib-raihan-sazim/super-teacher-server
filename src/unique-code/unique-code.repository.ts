import { Injectable } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { UniqueCode } from "../common/entities/unique_codes.entity";

@Injectable()
export class UniqueCodeRepository {
  async findByEmail(email: string, em: EntityManager): Promise<UniqueCode | null> {
    const unique = await em.findOne(UniqueCode, { email });
    return unique;
  }

  async findByCode(code: string, em: EntityManager): Promise<UniqueCode | null> {
    const unique = await em.findOne(UniqueCode, { code });
    return unique;
  }

  async create(email: string, code: string, em: EntityManager): Promise<UniqueCode> {
    const uniqueCode = em.create(UniqueCode, { code, email, usageCount: 0 });
    await em.persistAndFlush(uniqueCode);
    return uniqueCode;
  }

  async incrementUsageCount(uniqueCode: UniqueCode, em: EntityManager): Promise<void> {
    uniqueCode.usageCount += 1;
    await em.persistAndFlush(uniqueCode);
  }

  async delete(uniqueCode: UniqueCode, em: EntityManager): Promise<void> {
    await em.removeAndFlush(uniqueCode);
  }
}
