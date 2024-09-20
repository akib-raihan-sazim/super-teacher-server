import { IsString, IsNumber, IsUrl } from "class-validator";

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
