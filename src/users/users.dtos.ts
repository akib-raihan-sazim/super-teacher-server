import { IsEmail, IsEnum, IsString } from "class-validator";

import { EUserType } from "@/common/enums/users.enums";

export class CreateUserDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(EUserType)
  userType!: EUserType;
}
