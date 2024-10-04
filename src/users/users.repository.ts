import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import * as bcrypt from "bcrypt";

import { User } from "@/common/entities/users.entity";

import { CreateUserDto, EditUserDto } from "./users.dtos";

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.em.create(User, createUserDto);
    await this.em.persistAndFlush(user);
    return user;
  }

  async updateUser(user: User, editUserDto: EditUserDto): Promise<void> {
    this.em.assign(user, editUserDto);
    await this.em.flush();
  }

  async updateUserPassword(user: User, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.em.flush();
  }
}
