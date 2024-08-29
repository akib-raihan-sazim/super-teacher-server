import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  Rel,
  EntityRepositoryType,
} from "@mikro-orm/core";

import { ClassroomsRepository } from "@/classrooms/classrooms.repository";

import { WeekDay } from "../enums/classroom.enums";
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

  @Property({ fieldName: "class_time", type: "time" })
  classTime!: Date;

  @Enum(() => WeekDay)
  @Property({ fieldName: "days", type: "array" })
  days!: WeekDay[];

  @ManyToOne(() => Teacher)
  teacher!: Rel<Teacher>;
}
