import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Student } from "@/common/entities/students.entity";
import { EditStudentDto } from "@/users/users.dtos";

@Injectable()
export class StudentsRepository extends EntityRepository<Student> {
  async updateStudentFields(student: Student, editStudentDto: EditStudentDto): Promise<void> {
    this.em.assign(student, editStudentDto);
    await this.em.flush();
  }
}
