import { Injectable, NotFoundException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { User } from "@/common/entities/users.entity";
import { EnrollmentsRepository } from "@/enrollments/enrollments.repository";
import { UserRepository } from "@/users/users.repository";

import { CreateClassroomDto, ClassroomResponseDto, UpdateClassroomDto } from "./classrooms.dtos";
import { ClassroomsRepository } from "./classrooms.repository";

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly userRepository: UserRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly em: EntityManager,
  ) {}

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    authenticatedUserId: number,
  ): Promise<ClassroomResponseDto> {
    const user = await this.em.findOne(
      User,
      { id: authenticatedUserId },
      { populate: ["teacher"] },
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const classroom = this.classroomsRepository.create({
      ...createClassroomDto,
      teacher: user.teacher!,
    });

    await this.em.persistAndFlush(classroom);

    return new ClassroomResponseDto({
      id: classroom.id,
      title: classroom.title,
      subject: classroom.subject,
      classTime: classroom.classTime,
      days: classroom.days,
      userId: user.id,
    });
  }

  async getClassroomsForUser(userId: number): Promise<Classroom[]> {
    const user = await this.userRepository.findOneOrFail(
      { id: userId },
      { populate: ["teacher", "student"] },
    );
    let classrooms: Classroom[] = [];
    if (user.student) {
      const classroomIds = await this.enrollmentsRepository.getClassroomIdsForStudent(
        user.student.id,
      );
      classrooms = await this.classroomsRepository.find(
        { id: { $in: classroomIds } },
        {
          populate: ["teacher", "teacher.user"],
          orderBy: { classTime: "DESC" },
        },
      );
    } else if (user.teacher) {
      classrooms = await this.classroomsRepository.find(
        { teacher: user.teacher },
        {
          orderBy: { classTime: "DESC" },
          populate: ["teacher"],
        },
      );
    }
    return classrooms;
  }

  async getClassroomById(id: number, userId: number): Promise<Classroom | null> {
    await this.userRepository.findOneOrFail({ id: userId }, { populate: ["teacher"] });

    const classroom = await this.classroomsRepository.findOneOrFail(
      { id },
      { populate: ["teacher", "teacher.user"] },
    );

    return classroom;
  }

  async deleteClassroom(id: number, userId: number): Promise<boolean> {
    const classroom = await this.getClassroomById(id, userId);
    if (!classroom) {
      return false;
    }

    await this.classroomsRepository.deleteOne(classroom);
    return true;
  }

  async updateClassroom(
    id: number,
    updateClassroomDto: UpdateClassroomDto,
    userId: number,
  ): Promise<Classroom | null> {
    await this.userRepository.findOneOrFail({ id: userId }, { populate: ["teacher"] });
    const classroom = await this.classroomsRepository.findOneOrFail(
      { id },
      { populate: ["teacher"] },
    );
    return this.classroomsRepository.updateOne(classroom, updateClassroomDto);
  }

  async updateMeetLink(id: number, meetLink: string, userId: number): Promise<Classroom | null> {
    await this.userRepository.findOneOrFail({ id: userId }, { populate: ["teacher"] });
    const classroom = await this.classroomsRepository.findOneOrFail(
      { id },
      { populate: ["teacher"] },
    );
    classroom.meetLink = meetLink;
    await this.em.persistAndFlush(classroom);

    return classroom;
  }
}
