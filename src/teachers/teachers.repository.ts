import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Teacher } from "@/common/entities/teachers.entity";
import { EditTeacherDto } from "@/users/users.dtos";

@Injectable()
export class TeachersRepository extends EntityRepository<Teacher> {
  async updateTeacherFields(teacher: Teacher, editTeacherDto: EditTeacherDto): Promise<void> {
    this.em.assign(teacher, editTeacherDto);
    await this.em.flush();
  }
}
