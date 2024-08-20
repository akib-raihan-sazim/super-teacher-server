import { Entity, PrimaryKey, Property, OneToOne, Enum } from "@mikro-orm/core";

import { EEducationLevel, EMedium } from "../enums/students.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "students" })
export class Student extends CustomBaseEntity {
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
