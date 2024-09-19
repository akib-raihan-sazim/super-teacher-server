import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Exam } from "@/common/entities/exams.entity";

@Injectable()
export class ExamsRepository extends EntityRepository<Exam> {}
