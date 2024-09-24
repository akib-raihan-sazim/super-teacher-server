import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsNotEmpty()
  @Type(() => Number)
  classroomId!: number;
}
