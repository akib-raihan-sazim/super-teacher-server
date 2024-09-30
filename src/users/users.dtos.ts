import { Type } from "class-transformer";
import { IsEmail, IsString, IsOptional, IsEnum, ValidateNested, IsArray } from "class-validator";

import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
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

  @IsString()
  gender!: string;

  @IsEnum(EUserType)
  userType!: EUserType;
}

export class EditStudentDto {
  @IsOptional()
  @IsEnum(EEducationLevel)
  educationLevel?: EEducationLevel;

  @IsOptional()
  @IsString()
  phoneNo?: string;

  @IsOptional()
  @IsString()
  address?: string;

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

export class EditTeacherDto {
  @IsOptional()
  @IsString()
  highestEducationLevel?: string;

  @IsOptional()
  @IsString()
  majorSubject?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjectsToTeach?: string[];
}

export class EditUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsEnum(EUserType)
  userType?: EUserType;

  @IsOptional()
  @ValidateNested()
  @Type(() => EditStudentDto)
  student?: EditStudentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EditTeacherDto)
  teacher?: EditTeacherDto;
}
