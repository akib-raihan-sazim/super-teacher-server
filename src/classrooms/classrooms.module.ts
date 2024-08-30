import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Teacher } from "@/common/entities/teachers.entity";

import { ClassroomsController } from "./classrooms.controller";
import { ClassroomsService } from "./classrooms.service";

@Module({
  imports: [MikroOrmModule.forFeature([Classroom, Teacher])],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
})
export class ClassroomsModule {}
