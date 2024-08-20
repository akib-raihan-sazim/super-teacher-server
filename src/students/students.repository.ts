import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Student } from "@/common/entities/students.entity";

@Injectable()
export class StudentsRepository extends EntityRepository<Student> {}
