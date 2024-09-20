import { Type } from "class-transformer";
import { IsString, IsUrl, IsDate, IsNumber } from "class-validator";

import { Classroom } from "@/common/entities/classrooms.entity";

export class CreateAssignmentDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsUrl()
  fileUrl!: string;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsNumber()
  classroom!: Classroom;
}

export class UploadAssignmentDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;
}
