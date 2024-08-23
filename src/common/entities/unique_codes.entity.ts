import { Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";

import { CustomBaseEntity } from "./custom-base.entity";
import { Teacher } from "./teachers.entity";

@Entity({ tableName: "unique_codes" })
export class UniqueCode extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string;

  @Property()
  email!: string;

  @Property({ default: 0 })
  usageCount!: number;

  @OneToOne(() => Teacher, (teacher) => teacher.uniqueCode, { nullable: true })
  teacher?: Teacher;
}
