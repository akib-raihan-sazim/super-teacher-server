import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Enrollment } from "@/common/entities/enrollments.entity";

@Injectable()
export class EnrollmentsRepository extends EntityRepository<Enrollment> {}
