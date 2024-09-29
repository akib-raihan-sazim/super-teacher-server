import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";

import { UsersController } from "./users.controller";
import { UsersSerializer } from "./users.serializer";
import { UsersService } from "./users.service";

@Module({
  imports: [MikroOrmModule.forFeature([User, Student, Teacher])],
  providers: [UsersService, UsersSerializer],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
