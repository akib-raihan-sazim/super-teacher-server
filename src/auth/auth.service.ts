import { Injectable, ConflictException, BadRequestException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { User } from "@/common/entities/users.entity";

import { UniqueCodeService } from "../unique-code/unique-code.service";
import { RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly em: EntityManager, // Inject the EntityManager
  ) {}

  async registerStudent(registerStudentDto: RegisterStudentDto): Promise<User> {
    const existingUser = await this.authRepository.findUserByEmail(registerStudentDto.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    return this.authRepository.createStudent(registerStudentDto);
  }

  async registerTeacher(registerTeacherDto: RegisterTeacherDto): Promise<User> {
    const existingUser = await this.authRepository.findUserByEmail(registerTeacherDto.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    // Use a forked EntityManager for this specific operation
    const scopedEm = this.em.fork();

    try {
      await this.uniqueCodeService.validateAndIncrementUniqueCode(
        registerTeacherDto.email,
        registerTeacherDto.uniqueCode,
        scopedEm, // Pass the scoped EntityManager
      );
      return this.authRepository.createTeacher(registerTeacherDto);
    } catch (error) {
      if (error instanceof BadRequestException && error.message.includes("deleted")) {
        throw new BadRequestException("Unique code has expired. Please generate a new code.");
      }
      throw error;
    }
  }
}
