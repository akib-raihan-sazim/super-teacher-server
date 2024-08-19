import { Entity, Enum, OneToOne, Property, PrimaryKey } from "@mikro-orm/core";

import { EducationLevel } from "../enums/educationLevel.enum";
import { Medium } from "../enums/studentMedium.enum";
import { Degree } from "../enums/stutdentDegree.enum";
import { UserProfile } from "./user-profiles.entity";

@Entity({ tableName: 'students' })
export class Student {
  @PrimaryKey({ fieldName: 'id' })
  id!: number;

  @OneToOne(() => UserProfile)
  userProfile!: UserProfile;

  @Enum(() => EducationLevel)
  @Property({ fieldName: 'education_level' })
  educationLevel!: EducationLevel;

  @Enum(() => Medium)
  @Property({ fieldName: 'medium', nullable: true })
  medium?: Medium;

  @Property({ fieldName: 'class', nullable: true })
  class?: string;

  @Enum(() => Degree)
  @Property({ fieldName: 'degree', nullable: true })
  degree?: Degree;

  @Property({ fieldName: 'degree_name', nullable: true })
  degreeName?: string;

  @Property({ fieldName: 'semester_or_year', nullable: true })
  semesterOrYear?: string;
}
