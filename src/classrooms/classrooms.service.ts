import { Injectable, NotFoundException } from "@nestjs/common";

import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { Classroom } from "@/common/entities/classrooms.entity";
import { User } from "@/common/entities/users.entity";

import { CreateClassroomDto, ClassroomResponseDto } from "./classrooms.dtos";
import { ClassroomsRepository } from "./classrooms.repository";

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomsRepository: ClassroomsRepository,
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
}
