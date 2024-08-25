import { Injectable } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import * as bcrypt from "bcrypt";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { UniqueCode } from "@/common/entities/unique_codes.entity";
import { User } from "@/common/entities/users.entity";
import { EMedium } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

import { RegisterStudentDto, RegisterTeacherDto } from "./auth.dtos";

@Injectable()
export class AuthRepository {
  constructor(private readonly em: EntityManager) {}

  async createStudent(registerStudentDto: RegisterStudentDto): Promise<User> {
    const user = await this.em.transactional(async (em) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerStudentDto.password, saltRounds);

      const user = em.create(User, {
        ...registerStudentDto,
        password: hashedPassword,
        userType: EUserType.STUDENT,
      });

      const medium =
        registerStudentDto.medium === undefined ? EMedium.NONE : registerStudentDto.medium;

      const student = em.create(Student, {
        educationLevel: registerStudentDto.educationLevel,
        medium: medium,
        class: registerStudentDto.class,
        degree: registerStudentDto.degree,
        degreeName: registerStudentDto.degreeName,
        semester: registerStudentDto.semester,
        user: user,
      });

      await em.persistAndFlush([user, student]);
      return user;
    });
    return user;
  }

  async createTeacher(registerTeacherDto: RegisterTeacherDto): Promise<User> {
    const user = await this.em.transactional(async (em) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerTeacherDto.password, saltRounds);

      const user = em.create(User, {
        ...registerTeacherDto,
        password: hashedPassword,
        userType: EUserType.TEACHER,
      });

      const uniqueCode = await em.findOne(UniqueCode, { code: registerTeacherDto.uniqueCode });
      if (!uniqueCode) {
        throw new Error("Invalid unique code");
      }

      const teacher = em.create(Teacher, {
        highestEducationLevel: registerTeacherDto.highestEducationLevel,
        majorSubject: registerTeacherDto.majorSubject,
        subjectsToTeach: registerTeacherDto.subjectsToTeach,
        user: user,
      });

      await em.persistAndFlush([user, teacher, uniqueCode]);
      return user;
    });
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.em.findOne(User, { email });
    return user;
  }
}
