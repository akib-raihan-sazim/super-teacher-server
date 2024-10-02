import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Otp } from "@/common/entities/otp.entity";

@Injectable()
export class OtpRepository extends EntityRepository<Otp> {}
