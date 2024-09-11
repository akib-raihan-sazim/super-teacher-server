import { Injectable } from "@nestjs/common";

import { Student } from "@/common/entities/students.entity";
import { EnrollmentsRepository } from "@/enrollments/enrollments.repository";

import { StudentsRepository } from "./students.repository";

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
  ) {}

  async getUnenrolledStudents(classroomId: number): Promise<Student[]> {
    const enrolledStudentIds = await this.enrollmentsRepository
      .find({ classroom: { id: classroomId } }, { fields: ["student.id"] })
      .then((enrollments) => enrollments.map((e) => e.student.id));

    console.log("enrolled:", enrolledStudentIds);

    const unenrolledStudents = await this.studentsRepository.find(
      {
        id: { $nin: enrolledStudentIds },
      },
      {
        populate: ["user"],
      },
    );

    return unenrolledStudents;
  }
}
