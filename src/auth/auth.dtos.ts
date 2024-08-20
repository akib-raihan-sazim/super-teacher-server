import { IsEnum, IsOptional, IsString } from "class-validator";

import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
import { CreateUserDto } from "@/users/users.dtos";

export class RegisterStudentDto extends CreateUserDto {
  @IsEnum(EEducationLevel)
  educationLevel!: EEducationLevel;

  @IsOptional()
  @IsEnum(EMedium)
  medium?: EMedium;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  degreeName?: string;

  @IsOptional()
  @IsString()
  semester?: string;
}
