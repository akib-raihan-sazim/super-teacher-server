import {
  Entity,
  EntityRepositoryType,
  Enum,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { UserRepository } from "@/users/users.repository";

import { EUserType } from "../enums/users.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { Student } from "./students.entity";
import { Teacher } from "./teachers.entity";

@Entity({ tableName: "users", repository: () => UserRepository })
export class User extends CustomBaseEntity {
  [EntityRepositoryType]?: UserRepository;
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "first_name" })
  firstName!: string;

  @Property({ fieldName: "last_name" })
  lastName!: string;

  @Property({ unique: true, fieldName: "email" })
  email!: string;

  @Property({ fieldName: "password" })
  password!: string;

  @Enum(() => EUserType)
  @Property({ fieldName: "user_type" })
  userType!: EUserType;

  @OneToOne(() => Student, (student) => student.user, { nullable: true })
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user, { nullable: true })
  teacher?: Teacher;
}
