import { Entity, OneToOne, Property, PrimaryKey } from "@mikro-orm/core";

import { UserProfile } from "./user-profiles.entity";

@Entity({ tableName: 'teachers' })
export class Teacher {
  @PrimaryKey({ fieldName: 'id' })
  id!: number;

  @OneToOne(() => UserProfile)
  userProfile!: UserProfile;

  @Property({ fieldName: 'unique_code', type: 'varchar', unique: true })
  uniqueCode!: string;

  @Property({ fieldName: 'highest_education_level', type: 'varchar' })
  highestEducationLevel!: string;

  @Property({ fieldName: 'major_subject', type: 'varchar' })
  majorSubject!: string;

  @Property({ fieldName: 'subjects_to_teach', type: 'text' })
  subjectsToTeach!: string;
}
