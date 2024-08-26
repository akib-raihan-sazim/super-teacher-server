import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Teacher } from "@/common/entities/teachers.entity";

@Injectable()
export class TeachersRepository extends EntityRepository<Teacher> {}
