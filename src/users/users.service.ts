import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";

import { EntityManager } from "@mikro-orm/postgresql";

import * as bcrypt from "bcrypt";

import { User } from "@/common/entities/users.entity";
import { EUserType } from "@/common/enums/users.enums";
import { StudentsRepository } from "@/students/students.repository";
import { TeachersRepository } from "@/teachers/teachers.repository";

import { CreateUserDto, EditUserDto, ResetPasswordDto } from "./users.dtos";
import { UserRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly em: EntityManager,
    private readonly studentsRepository: StudentsRepository,
    private readonly teachersRepository: TeachersRepository,
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

  async editUser(userId: number, editUserDto: EditUserDto): Promise<User> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ["student", "teacher"],
    });

    const { student: studentDto, teacher: teacherDto, ...userFields } = editUserDto;

    await this.userRepository.updateUser(user, userFields);

    if (user.userType === EUserType.STUDENT && studentDto) {
      if (!user.student) {
        throw new InternalServerErrorException(
          "User marked as student but student data is missing",
        );
      }
      this.studentsRepository.updateStudentFields(user.student, studentDto);
    }

    if (user.userType === EUserType.TEACHER && teacherDto) {
      if (!user.teacher) {
        throw new InternalServerErrorException(
          "User marked as teacher but teacher data is missing",
        );
      }
      this.teachersRepository.updateTeacherFields(user.teacher, teacherDto);
    }
    return user;
  }

  async resetPassword(userId: number, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOneOrFail(userId);

    const isOldPasswordValid = await bcrypt.compare(resetPasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Old password is incorrect");
    }

    if (resetPasswordDto.oldPassword === resetPasswordDto.newPassword) {
      throw new BadRequestException("Cannot set a previously used password");
    }

    await this.userRepository.updateUserPassword(user, resetPasswordDto.newPassword);
  }
}
