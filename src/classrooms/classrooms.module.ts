import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";

import { ClassroomsController } from "./classrooms.controller";
import { ClassroomsSerializer } from "./classrooms.serializer";
import { ClassroomsService } from "./classrooms.service";

@Module({
  imports: [MikroOrmModule.forFeature([Classroom, Teacher, User])],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, ClassroomsSerializer],
})
export class ClassroomsModule {}
