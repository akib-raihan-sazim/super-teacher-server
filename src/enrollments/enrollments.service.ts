import { Injectable, ConflictException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { MailService } from "@/mail/mail.service";
import { StudentsRepository } from "@/students/students.repository";

import { CreateEnrollmentDto, EnrollmentResponseDto } from "./enrollments.dtos";
import { EnrollmentsRepository } from "./enrollments.repository";

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly studentRepository: StudentsRepository,
    private readonly classroomRepository: ClassroomsRepository,
    private readonly enrollmentRepository: EnrollmentsRepository,
    private readonly mailService: MailService,
  ) {}

  async enrollStudent(createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const { studentId, classroomId } = createEnrollmentDto;

    const student = await this.studentRepository.findOneOrFail(
      { id: studentId },
      { populate: ["user"] },
    );

    const classroom = await this.classroomRepository.findOneOrFail({ id: classroomId });

    const existingEnrollment = await this.enrollmentRepository.findOne({ student, classroom });
    if (existingEnrollment) {
      throw new ConflictException(`Student is already enrolled in this classroom`);
    }

    const enrollment = this.enrollmentRepository.create({ student, classroom });

    await this.em.persistAndFlush(enrollment);

    await this.mailService.sendEmail(
      student.user.email,
      "Enrollment Done",
      `Hello ${student.user.firstName}! You are enrolled in the clasroom.`,
    );

    return new EnrollmentResponseDto(enrollment.id, student.id, classroom.id);
  }
}
