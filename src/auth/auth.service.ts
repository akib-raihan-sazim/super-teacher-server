import { Injectable, ConflictException } from "@nestjs/common";

import { User } from "@/common/entities/users.entity";

import { RegisterStudentDto } from "./auth.dtos";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async registerStudent(registerStudentDto: RegisterStudentDto): Promise<User> {
    const existingUser = await this.authRepository.findUserByEmail(registerStudentDto.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    return this.authRepository.createStudent(registerStudentDto);
  }
}
