import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Enrollment } from "@/common/entities/enrollments.entity";

@Injectable()
export class EnrollmentsRepository extends EntityRepository<Enrollment> {
  async getClassroomIdsForStudent(studentId: number): Promise<number[]> {
    const enrollments = await this.find({ student: studentId });
    return enrollments.map((enrollment) => enrollment.classroom.id);
  }
}
