import { Injectable } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { User } from "@/common/entities/users.entity";

import { CreateUserDto } from "./users.dtos";

@Injectable()
export class UserRepository {
  constructor(private readonly em: EntityManager) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.em.create(User, createUserDto);
    await this.em.persistAndFlush(user);
    return user;
  }
}
