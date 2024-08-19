import { BadRequestException } from "@nestjs/common";

import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
  ManyToOne,
  EntityRepositoryType,
  Enum,
} from "@mikro-orm/core";

import { UserProfilesRepository } from "@/user-profiles/user-profiles.repository";

import { Gender } from "../enums/userGender.enum";
import { CustomBaseEntity } from "./custom-base.entity";
import { Role } from "./roles.entity";
import { User } from "./users.entity";

@Entity({
  tableName: "user_profiles",
  repository: () => UserProfilesRepository,
})
export class UserProfile extends CustomBaseEntity {
  [EntityRepositoryType]?: UserProfilesRepository;

  constructor(firstName: string, lastName: string) {
    super();

    this.firstName = firstName;
    this.lastName = lastName;
  }

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ fieldName: "first_name" })
  firstName!: string;

  @Property({ fieldName: "last_name" })
  lastName!: string;

  @Enum(() => Gender)
  @Property({ fieldName: "gender" })
  gender!: Gender;

  @Property({ fieldName: "phone_number" })
  phoneNumber!: string;

  @Property({fieldName: "address"})
  address!: string;

  @Property({ persist: false })
  get email() {
    return this.user === undefined
      ? new BadRequestException("User not properly defined")
      : this.user.email;
  }

  @OneToOne(() => User, { hidden: true })
  user!: Rel<User>;

  @ManyToOne(() => Role)
  role!: Rel<Role>;
}
