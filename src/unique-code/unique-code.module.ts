import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { UniqueCode } from "@/common/entities/unique_codes.entity";

import { GenerateUniqueCodeCommand } from "./generate-unique-code.command";
import { UniqueCodeController } from "./unique-code.controller";
import { UniqueCodeRepository } from "./unique-code.repository";
import { UniqueCodeService } from "./unique-code.service";

@Module({
  imports: [MikroOrmModule.forFeature([UniqueCode])],
  controllers: [UniqueCodeController],
  providers: [UniqueCodeService, UniqueCodeRepository, GenerateUniqueCodeCommand],
  exports: [UniqueCodeService, UniqueCodeRepository],
})
export class UniqueCodeModule {}
