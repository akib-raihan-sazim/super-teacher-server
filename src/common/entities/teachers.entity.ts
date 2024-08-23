import { Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";

import { CustomBaseEntity } from "./custom-base.entity";
import { UniqueCode } from "./unique_codes.entity";
import { User } from "./users.entity";

@Entity({ tableName: "teachers" })
export class Teacher extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "highest_education_level" })
  highestEducationLevel!: string;

  @Property({ fieldName: "major_subject" })
  majorSubject!: string;

  @Property({ fieldName: "subjects_to_teach", type: "array" })
  subjectsToTeach!: string[];

  @OneToOne(() => User, (user) => user.teacher, { owner: true })
  user!: User;

  @OneToOne(() => UniqueCode, (uniqueCode) => uniqueCode.teacher, { owner: true })
  uniqueCode!: UniqueCode;
}
