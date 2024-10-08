import { Transform, Expose } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateExamDto {
  @IsString()
  title!: string;

  @IsString()
  instruction!: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date!: Date;
}

export class ExamResponseDto {
  @Expose()
  id?: number;

  @Expose()
  title!: string;

  @Expose()
  instruction!: string;

  @Expose()
  date!: Date;

  @Expose()
  classroomId!: number;

  constructor(partial: Partial<ExamResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date?: Date;
}
