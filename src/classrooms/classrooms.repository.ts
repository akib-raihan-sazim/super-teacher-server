import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Classroom } from "@/common/entities/classrooms.entity";

import { UpdateClassroomDto } from "./classrooms.dtos";

@Injectable()
export class ClassroomsRepository extends EntityRepository<Classroom> {
  async updateOne(
    classroom: Classroom,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<Classroom> {
    this.em.assign(classroom, updateClassroomDto);
    await this.em.persistAndFlush(classroom);
    return classroom;
  }
}
