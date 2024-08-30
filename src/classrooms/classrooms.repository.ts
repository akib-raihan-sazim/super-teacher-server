import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/core";

import { Classroom } from "@/common/entities/classrooms.entity";

@Injectable()
export class ClassroomsRepository extends EntityRepository<Classroom> {}
