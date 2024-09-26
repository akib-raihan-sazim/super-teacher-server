import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "@/mail/mail.module";
import { OtpModule } from "@/otp/otp.module";
import { UniqueCodeModule } from "@/unique-code/unique-code.module";

import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    OtpModule,
    MailModule,
    UsersModule,
    UniqueCodeModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: configService.get<string>("JWT_TOKEN_LIFETIME") },
      }),
    }),
  ],
  providers: [AuthService, AuthRepository, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
