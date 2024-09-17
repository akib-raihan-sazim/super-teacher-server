import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Resources } from "@/common/entities/resources.entity";

import { FileUploadsModule } from "../file-uploads/file-uploads.module";
import { ClassworksController } from "./classworks.controller";
import { ClassworksService } from "./classworks.service";

@Module({
  imports: [MikroOrmModule.forFeature([Classroom, Resources]), FileUploadsModule],
  controllers: [ClassworksController],
  providers: [ClassworksService],
})
export class ClassworksModule {}
