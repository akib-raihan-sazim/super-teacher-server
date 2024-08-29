import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Classroom } from "@/common/entities/classroom.entity";

@Injectable()
export class ClassroomsRepository extends EntityRepository<Classroom> {}
