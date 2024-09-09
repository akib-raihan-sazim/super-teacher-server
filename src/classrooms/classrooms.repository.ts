import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Classroom } from "@/common/entities/classrooms.entity";

@Injectable()
export class ClassroomsRepository extends EntityRepository<Classroom> {
  async deleteOne(classroom: Classroom): Promise<void> {
    await this.em.removeAndFlush(classroom);
  }
}
