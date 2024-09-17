import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Resources } from "@/common/entities/resources.entity";

import { CreateResourceDto } from "./resources.dtos";

@Injectable()
export class ResourcesRepository extends EntityRepository<Resources> {
  async createOne(resourceData: CreateResourceDto): Promise<Resources> {
    const resource = this.create(resourceData);
    await this.em.persistAndFlush(resource);
    return resource;
  }
}
