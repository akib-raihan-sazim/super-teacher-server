import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";

import { EntityManager } from "@mikro-orm/postgresql";

import * as bcrypt from "bcrypt";

import { User } from "@/common/entities/users.entity";
import { EUserType } from "@/common/enums/users.enums";

import { CreateUserDto, EditUserDto, ResetPasswordDto } from "./users.dtos";
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
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ["student", "teacher"],
    });
    return user;
  }

  async editUser(userId: number, editUserDto: EditUserDto): Promise<User> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ["student", "teacher"],
    });

    await this.userRepository.updateUser(user, editUserDto);

    if (user.userType === EUserType.STUDENT && editUserDto.student) {
      if (!user.student) {
        throw new BadRequestException("User is not a student");
      }
      await this.userRepository.updateStudentFields(user.student, editUserDto.student);
    }

    if (user.userType === EUserType.TEACHER && editUserDto.teacher) {
      if (!user.teacher) {
        throw new BadRequestException("User is not a teacher");
      }
      await this.userRepository.updateTeacherFields(user.teacher, editUserDto.teacher);
    }

    return user;
  }

  async resetPassword(userId: number, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isOldPasswordValid = await bcrypt.compare(resetPasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Old password is incorrect");
    }

    if (resetPasswordDto.oldPassword === resetPasswordDto.newPassword) {
      throw new BadRequestException("New password must be different from the old password");
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    user.password = hashedPassword;

    await this.em.flush();
  }
}
