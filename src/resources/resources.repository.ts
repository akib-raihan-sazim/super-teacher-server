import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Resources } from "@/common/entities/resources.entity";

@Injectable()
export class ResourcesRepository extends EntityRepository<Resources> {}
