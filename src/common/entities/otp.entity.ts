import { Entity, PrimaryKey, Property, EntityRepositoryType } from "@mikro-orm/core";

import { OtpRepository } from "@/otp/otp.repository";

import { CustomBaseEntity } from "./custom-base.entity";

@Entity({ tableName: "otps", repository: () => OtpRepository })
export class Otp extends CustomBaseEntity {
  [EntityRepositoryType]?: OtpRepository;

  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  otp!: string;

  @Property()
  email!: string;

  @Property()
  expiresAt!: Date;
}
