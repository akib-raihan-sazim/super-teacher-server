import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Assignment } from "@/common/entities/assignments.entity";

@Injectable()
export class AssignmentsRepository extends EntityRepository<Assignment> {}
