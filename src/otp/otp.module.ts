import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Otp } from "@/common/entities/otp.entity";

import { OtpService } from "./otp.service";

@Module({
  imports: [MikroOrmModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
