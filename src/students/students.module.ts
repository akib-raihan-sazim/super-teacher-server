import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Enrollment } from "@/common/entities/enrollments.entity";
import { Student } from "@/common/entities/students.entity";

import { StudentsController } from "./students.controller";
import { StudentSerializer } from "./students.serializer";
import { StudentsService } from "./students.service";

@Module({
  imports: [MikroOrmModule.forFeature([Student, Enrollment])],
  controllers: [StudentsController],
  providers: [StudentsService, StudentSerializer],
  exports: [StudentsService],
})
export class StudentsModule {}
