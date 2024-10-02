import { Injectable } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/postgresql";

import { User } from "@/common/entities/users.entity";

import { CreateUserDto } from "./users.dtos";
import { UserRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly em: EntityManager,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.createUser(createUserDto);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.em.findOne(User, { email });
    return user;
  }

  async getDetails(userId: number): Promise<User> {
    const user = await this.userRepository.findOneOrFail(userId);

    if (user.userType === "student") {
      return this.userRepository.findOneOrFail(userId, { populate: ["student"] });
    } else if (user.userType === "teacher") {
      return this.userRepository.findOneOrFail(userId, { populate: ["teacher"] });
    }

    return user;
  }
}
