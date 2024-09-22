import { IsString, IsNumber, IsUrl, IsOptional } from "class-validator";

import { Classroom } from "@/common/entities/classrooms.entity";

export class CreateResourceDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsUrl()
  fileUrl!: string;

  @IsNumber()
  classroom!: Classroom;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  classroom?: Classroom;
}
