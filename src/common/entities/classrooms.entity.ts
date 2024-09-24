import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Rel,
  EntityRepositoryType,
} from "@mikro-orm/core";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Teacher } from "./teachers.entity";

@Entity({ tableName: "classrooms", repository: () => ClassroomsRepository })
export class Classroom extends CustomBaseEntity {
  [EntityRepositoryType]?: ClassroomsRepository;
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "title" })
  title!: string;

  @Property({ fieldName: "subject" })
  subject!: string;

  @Property({ fieldName: "class_time" })
  classTime!: Date;

  @Property({ fieldName: "days", type: "array" })
  days!: string[];

  @Property({ fieldName: "meet_link", nullable: true })
  meetLink?: string;

  @ManyToOne(() => Teacher)
  teacher!: Rel<Teacher>;
}
