import { Entity, PrimaryKey, ManyToOne, Rel, EntityRepositoryType } from "@mikro-orm/core";

import { EnrollmentsRepository } from "@/enrollments/enrollments.repository";

import { Classroom } from "./classrooms.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { Student } from "./students.entity";

@Entity({ tableName: "enrollments", repository: () => EnrollmentsRepository })
export class Enrollment extends CustomBaseEntity {
  [EntityRepositoryType]?: EnrollmentsRepository;
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Student)
  student!: Rel<Student>;

  @ManyToOne(() => Classroom)
  classroom!: Rel<Classroom>;
}
