import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Enrollment } from "@/common/entities/enrollments.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";
import { EnrollmentsModule } from "@/enrollments/enrollments.module";

import { ClassroomsController } from "./classrooms.controller";
import { ClassroomsSerializer } from "./classrooms.serializer";
import { ClassroomsService } from "./classrooms.service";

@Module({
  imports: [MikroOrmModule.forFeature([Classroom, Teacher, User, Enrollment]), EnrollmentsModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, ClassroomsSerializer],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
