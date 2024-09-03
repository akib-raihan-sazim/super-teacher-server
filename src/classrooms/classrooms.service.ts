import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { User } from "@/common/entities/users.entity";
import { UserRepository } from "@/users/users.repository";

import { CreateClassroomDto, ClassroomResponseDto } from "./classrooms.dtos";
import { ClassroomsRepository } from "./classrooms.repository";

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomsRepository: ClassroomsRepository,
    private readonly userRepository: UserRepository,
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
    const user = await this.em.findOne(User, { id: userId }, { populate: ["teacher"] });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const classrooms = await this.em.find(
      Classroom,
      { teacher: user.teacher },
      {
        orderBy: { classTime: "DESC" },
        populate: ["teacher"],
      },
    );
    // TODO: query for fetching classrooms that a student is enrolled in.
    return classrooms;
  }

  async getClassroomById(id: number, userId: number): Promise<Classroom | null> {
    const user = await this.userRepository.findOneOrFail({ id: userId }, { populate: ["teacher"] });

    const classroom = await this.classroomsRepository.findOneOrFail(
      { id },
      { populate: ["teacher"] },
    );

    if (user.teacher && classroom.teacher.id !== user.teacher.id) {
      throw new ForbiddenException("You do not have permission to access this classroom");
    }
    // TODO: Add check for students enrolled in the classroom
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
}
