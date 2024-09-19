import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Exam } from "@/common/entities/exams.entity";

import { CreateExamDto } from "./exams.dtos";
import { ExamsRepository } from "./exams.repository";

@Injectable()
export class ExamsService {
  constructor(
    private readonly examsRepository: ExamsRepository,
    private readonly classroomsRepository: ClassroomsRepository,
  ) {}

  async createOne(classroomId: number, createExamDto: CreateExamDto): Promise<Exam> {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    const exam = await this.examsRepository.createOne(createExamDto, classroom);

    return exam;
  }
}
