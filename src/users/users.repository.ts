import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { User } from "@/common/entities/users.entity";

import { CreateUserDto } from "./users.dtos";

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.em.create(User, createUserDto);
    await this.em.persistAndFlush(user);
    return user;
  }
}
