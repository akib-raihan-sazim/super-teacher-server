import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  Enum,
  EntityRepositoryType,
} from "@mikro-orm/core";

import { StudentsRepository } from "@/students/students.repository";

import { EEducationLevel, EMedium } from "../enums/students.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "students", repository: () => StudentsRepository })
export class Student extends CustomBaseEntity {
  [EntityRepositoryType]?: StudentsRepository;

  @PrimaryKey()
  id!: number;

  @Enum(() => EEducationLevel)
  @Property({ fieldName: "education_level" })
  educationLevel!: EEducationLevel;

  @Enum(() => EMedium)
  @Property({ fieldName: "medium", nullable: true })
  medium?: EMedium;

  @Property({ fieldName: "class", nullable: true })
  class?: string;

  @Property({ fieldName: "degree", nullable: true })
  degree?: string;

  @Property({ fieldName: "degree_name", nullable: true })
  degreeName?: string;

  @Property({ fieldName: "semester", nullable: true })
  semester?: string;

  @OneToOne(() => User, (user) => user.student, { owner: true })
  user!: User;
}
