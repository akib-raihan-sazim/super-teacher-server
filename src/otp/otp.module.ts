import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Otp } from "@/common/entities/otp.entity";

import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";

@Module({
  imports: [MikroOrmModule.forFeature([Otp])],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
