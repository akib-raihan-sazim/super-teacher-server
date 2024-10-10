import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Otp } from "@/common/entities/otp.entity";

@Injectable()
export class OtpRepository extends EntityRepository<Otp> {
  async createOne(otp: Otp): Promise<void> {
    await this.em.persistAndFlush(otp);
  }

  async removeOne(otp: Otp): Promise<void> {
    await this.em.removeAndFlush(otp);
  }
}
