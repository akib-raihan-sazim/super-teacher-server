import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Student } from "@/common/entities/students.entity";
import { User } from "@/common/entities/users.entity";

import { UsersController } from "./users.controller";
import { UserRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
  imports: [MikroOrmModule.forFeature([User, Student])],
  providers: [UsersService, UserRepository],
  controllers: [UsersController],
  exports: [MikroOrmModule.forFeature([User, Student]), UsersService],
})
export class UsersModule {}
