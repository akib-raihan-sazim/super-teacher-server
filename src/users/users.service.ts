import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/postgresql";

import { User } from "@/common/entities/users.entity";
import { EUserType } from "@/common/enums/users.enums";
import { StudentsRepository } from "@/students/students.repository";
import { TeachersRepository } from "@/teachers/teachers.repository";

import { CreateUserDto, EditUserDto } from "./users.dtos";
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
}
