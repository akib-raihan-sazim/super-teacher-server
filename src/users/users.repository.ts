import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";

import { CreateUserDto, EditStudentDto, EditTeacherDto, EditUserDto } from "./users.dtos";

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.em.create(User, createUserDto);
    await this.em.persistAndFlush(user);
    return user;
  }

  async updateUser(user: User, editUserDto: EditUserDto): Promise<void> {
    const { firstName, lastName, email, gender } = editUserDto;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (gender) user.gender = gender;

    await this.em.flush();
  }

  async updateStudentFields(student: Student, editStudentDto: EditStudentDto): Promise<void> {
    const {
      educationLevel,
      phoneNo,
      address,
      medium,
      class: studentClass,
      degree,
      degreeName,
      semester,
    } = editStudentDto;

    if (educationLevel) student.educationLevel = educationLevel;
    if (phoneNo) student.phoneNo = phoneNo;
    if (address) student.address = address;
    if (medium) student.medium = medium;
    if (studentClass) student.class = studentClass;
    if (degree) student.degree = degree;
    if (degreeName) student.degreeName = degreeName;
    if (semester) student.semester = semester;

    await this.em.flush();
  }

  async updateTeacherFields(teacher: Teacher, editTeacherDto: EditTeacherDto): Promise<void> {
    Object.assign(teacher, editTeacherDto);
    await this.em.flush();
  }
}
