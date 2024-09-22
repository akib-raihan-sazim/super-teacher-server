import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { Resources } from "@/common/entities/resources.entity";

import { CreateResourceDto, UpdateResourceDto } from "./resources.dtos";

@Injectable()
export class ResourcesRepository extends EntityRepository<Resources> {
  async createOne(createResourceDto: CreateResourceDto): Promise<Resources> {
    const resource = this.create(createResourceDto);
    await this.em.persistAndFlush(resource);
    return resource;
  }

  async deleteOne(resource: Resources): Promise<void> {
    await this.em.removeAndFlush(resource);
  }

  async updateOne(resource: Resources, updateResourceDto: UpdateResourceDto): Promise<Resources> {
    this.assign(resource, updateResourceDto);
    await this.em.persistAndFlush(resource);
    return resource;
  }
}
