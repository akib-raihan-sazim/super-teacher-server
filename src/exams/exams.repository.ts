import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Exam } from "@/common/entities/exams.entity";

import { CreateExamDto } from "./exams.dtos";

@Injectable()
export class ExamsRepository extends EntityRepository<Exam> {
  async createOne(createExamDto: CreateExamDto, classroom: Classroom): Promise<Exam> {
    const exam = this.create({
      ...createExamDto,
      classroom,
    });

    await this.em.persistAndFlush(exam);
    return exam;
  }
}
