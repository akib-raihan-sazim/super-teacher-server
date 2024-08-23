import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EntityManager } from "@mikro-orm/core"; // Import EntityManager

import { UniqueCodeService } from "./unique-code.service";

@Controller("unique-code")
export class UniqueCodeController {
  constructor(
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager, // Inject the EntityManager
  ) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  async generateUniqueCode(
    @Body("email") email: string,
    @Body("adminPassword") adminPassword: string,
  ) {
    const correctAdminPassword = this.configService.get<string>("ADMIN_PASSWORD");
    if (!correctAdminPassword) {
      throw new Error("ADMIN_PASSWORD is not set in the environment variables");
    }

    if (adminPassword !== correctAdminPassword) {
      throw new UnauthorizedException("Invalid admin password");
    }
    const scopedEm = this.em.fork();

    const code = await this.uniqueCodeService.generateUniqueCode(email, scopedEm); // Pass the scoped EntityManager
    return {
      message: "Unique code generated successfully",
      email,
      code,
    };
  }
}
