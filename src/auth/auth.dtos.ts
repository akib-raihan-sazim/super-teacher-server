import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
import { CreateUserDto } from "@/users/users.dtos";

export class RegisterStudentDto extends CreateUserDto {
  @IsEnum(EEducationLevel)
  educationLevel!: EEducationLevel;

  @IsString()
  phoneNo!: string;

  @IsString()
  address!: string;

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

export class RegisterTeacherDto extends CreateUserDto {
  @IsString()
  uniqueCode!: string;

  @IsString()
  highestEducationLevel!: EEducationLevel;

  @IsString()
  majorSubject!: string;

  @IsArray()
  @IsString({ each: true })
  subjectsToTeach!: string[];
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
