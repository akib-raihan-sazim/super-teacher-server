import { Injectable } from "@nestjs/common";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { Exam } from "@/common/entities/exams.entity";

import { CreateExamDto, UpdateExamDto } from "./exams.dtos";
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

  async getExamsByClassroomId(classroomId: number): Promise<Exam[]> {
    const classroom = await this.classroomsRepository.findOneOrFail({ id: classroomId });

    const exams = await this.examsRepository.find({ classroom });

    return exams;
  }

  async updateOne(examId: number, updateExamDto: UpdateExamDto): Promise<Exam> {
    const exam = await this.examsRepository.updateOne(examId, updateExamDto);
    return exam;
  }

  async deleteOne(examId: number): Promise<void> {
    const exam = await this.examsRepository.findOneOrFail({ id: examId });

    await this.examsRepository.deleteOne(exam);
  }
}
