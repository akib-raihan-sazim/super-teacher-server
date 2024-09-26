import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Assignment } from "@/common/entities/assignments.entity";

import { CreateAssignmentDto } from "./assignments.dtos";

@Injectable()
export class AssignmentsRepository extends EntityRepository<Assignment> {
  async createOne(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.create(createAssignmentDto);
    await this.em.persistAndFlush(assignment);
    return assignment;
  }
}
