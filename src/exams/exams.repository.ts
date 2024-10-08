import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Exam } from "@/common/entities/exams.entity";

import { CreateExamDto, UpdateExamDto } from "./exams.dtos";

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

  async updateOne(examId: number, updateExamDto: UpdateExamDto): Promise<Exam> {
    const exam = await this.findOneOrFail({ id: examId });
    Object.assign(exam, updateExamDto);
    await this.em.persistAndFlush(exam);
    return exam;
  }

  async deleteOne(exam: Exam): Promise<void> {
    await this.em.removeAndFlush(exam);
  }
}
