import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  EntityRepositoryType,
  Rel,
} from "@mikro-orm/core";

import { ResourcesRepository } from "@/resources/resources.repository";

import { Classroom } from "./classrooms.entity";
import { CustomBaseEntity } from "./custom-base.entity";

@Entity({ tableName: "resources", repository: () => ResourcesRepository })
export class Resources extends CustomBaseEntity {
  [EntityRepositoryType]?: ResourcesRepository;

  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "title" })
  title!: string;

  @Property({ fieldName: "description" })
  description!: string;

  @Property({ fieldName: "file_url" })
  fileUrl!: string;

  @ManyToOne(() => Classroom, { deleteRule: "cascade" })
  classroom!: Rel<Classroom>;
}
