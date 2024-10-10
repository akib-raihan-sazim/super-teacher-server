import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  Rel,
} from "@mikro-orm/core";

import { AssignmentsRepository } from "@/assignments/assignments.repository";

import { Classroom } from "./classrooms.entity";
import { CustomBaseEntity } from "./custom-base.entity";

@Entity({ tableName: "assignments", repository: () => AssignmentsRepository })
export class Assignment extends CustomBaseEntity {
  [EntityRepositoryType]?: AssignmentsRepository;

  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "title" })
  title!: string;

  @Property({ fieldName: "description" })
  description!: string;

  @Property({ fieldName: "file_url" })
  fileUrl!: string;

  @Property({ fieldName: "due_date" })
  dueDate!: Date;

  @ManyToOne(() => Classroom, { deleteRule: "cascade" })
  classroom!: Rel<Classroom>;
}
