import { Module } from "@nestjs/common";

import { UniqueCodeModule } from "@/unique-code/unique-code.module";

import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

@Module({
  imports: [UsersModule, UniqueCodeModule],
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
