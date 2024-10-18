import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Exam } from "@/common/entities/exams.entity";
import { CreateExamDto } from "@/exams/exams.dtos";

export async function createExamInDb(
  dbService: EntityManager<IDatabaseDriver<Connection>>,
  classroom: Classroom,
  examDto: CreateExamDto,
): Promise<Exam> {
  const exam = dbService.create(Exam, {
    ...examDto,
    classroom,
  });
  await dbService.persistAndFlush(exam);
  return exam;
}
