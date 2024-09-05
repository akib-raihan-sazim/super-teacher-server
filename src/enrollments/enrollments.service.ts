import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";
import { MailService } from "@/mail/mail.service";
import { StudentsRepository } from "@/students/students.repository";
import { UserRepository } from "@/users/users.repository";

import { CreateEnrollmentDto } from "./enrollments.dtos";
import { IEnrollment } from "./enrollments.interface";
import { EnrollmentsRepository } from "./enrollments.repository";

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly studentRepository: StudentsRepository,
    private readonly classroomRepository: ClassroomsRepository,
    private readonly enrollmentRepository: EnrollmentsRepository,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async enrollStudent(createEnrollmentDto: CreateEnrollmentDto): Promise<boolean> {
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

    return true;
  }

  async removeStudent(userId: number, deleteEnrollDto: CreateEnrollmentDto): Promise<void> {
    const { studentId, classroomId } = deleteEnrollDto;

    const user = await this.userRepository.findOneOrFail({ id: userId });
    const classroom = await this.classroomRepository.findOneOrFail({ id: classroomId });

    if (user.teacher && user.teacher.id !== classroom.teacher.id) {
      throw new UnauthorizedException("You are not authorized to remove this student!");
    }

    const student = await this.studentRepository.findOneOrFail({ id: studentId });

    const enrollment = await this.enrollmentRepository.findOneOrFail({ student, classroom });

    await this.em.removeAndFlush(enrollment);
  }

  async getStudentsForClassroom(classroomId: number): Promise<IEnrollment[]> {
    const classroom = await this.classroomRepository.findOneOrFail({ id: classroomId });

    const enrollments = await this.enrollmentRepository.find(
      { classroom },
      {
        populate: ["student", "student.user"],
      },
    );
    return enrollments;
  }
}
