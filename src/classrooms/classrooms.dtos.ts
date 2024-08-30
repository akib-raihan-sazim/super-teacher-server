import { Exclude, Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsArray, IsDateString } from "class-validator";

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsDateString()
  @IsNotEmpty()
  classTime!: Date;

  @IsArray()
  @IsString({ each: true })
  days!: string[];
}

@Exclude()
export class ClassroomResponseDto {
  @Expose()
  id?: number;

  @Expose()
  title!: string;

  @Expose()
  subject!: string;

  @Expose()
  classTime!: Date;

  @Expose()
  days!: string[];

  @Expose()
  userId!: number;

  constructor(partial: Partial<ClassroomResponseDto>) {
    Object.assign(this, partial);
  }
}
