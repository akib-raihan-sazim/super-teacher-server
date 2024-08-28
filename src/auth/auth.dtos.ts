import { Exclude, Expose, Type } from "class-transformer";
import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";
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

export class UserDto {
  @Expose()
  id?: number;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  email?: string;

  @Expose()
  userType?: "student" | "teacher";

  @Expose()
  student?: number;

  @Expose()
  teacher?: number;

  @Exclude()
  password!: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    if (partial.student && partial.student instanceof Student) {
      this.student = partial.student.id;
    }
    if (partial.teacher && partial.teacher instanceof Teacher) {
      this.teacher = partial.teacher.id;
    }
  }
}

export class AuthResponseDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  token: string;

  constructor(user: User, token: string) {
    this.user = new UserDto(user);
    this.token = token;
  }
}
