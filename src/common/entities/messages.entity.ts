import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  EntityRepositoryType,
  Rel,
} from "@mikro-orm/core";

import { MessagesRepository } from "@/messages/messages.repository";

import { Classroom } from "./classrooms.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "messages", repository: () => MessagesRepository })
export class Message extends CustomBaseEntity {
  [EntityRepositoryType]?: MessagesRepository;

  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "content" })
  content!: string;

  @Property({ fieldName: "attachment_url", nullable: true })
  attachmentUrl?: string;

  @ManyToOne(() => User)
  sender!: Rel<User>;

  @ManyToOne(() => Classroom)
  classroom!: Rel<Classroom>;
}
