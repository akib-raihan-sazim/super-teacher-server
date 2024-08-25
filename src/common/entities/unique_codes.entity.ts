import { Entity, PrimaryKey, Property, EntityRepositoryType } from "@mikro-orm/core";

import { UniqueCodeRepository } from "@/unique-code/unique-code.repository";

import { CustomBaseEntity } from "./custom-base.entity";

@Entity({ tableName: "unique_codes", repository: () => UniqueCodeRepository })
export class UniqueCode extends CustomBaseEntity {
  [EntityRepositoryType]?: UniqueCodeRepository;

  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string;

  @Property()
  email!: string;

  @Property({ default: 0 })
  usageCount!: number;
}
