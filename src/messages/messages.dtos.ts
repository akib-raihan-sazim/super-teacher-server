import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  attachmentURL?: string;

  @IsNotEmpty()
  @IsNumber()
  classroomId!: number;
}
