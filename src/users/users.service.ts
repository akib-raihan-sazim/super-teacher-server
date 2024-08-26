import { Injectable } from "@nestjs/common";

import { User } from "@/common/entities/users.entity";

import { CreateUserDto } from "./users.dtos";
import { UserRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.createUser(createUserDto);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findUserByEmail(email);
    return user;
  }
}
