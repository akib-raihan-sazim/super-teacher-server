import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateAssignmentSubmissionDto {
  @IsNumber()
  @Type(() => Number)
  assignmentId!: number;

  @IsNumber()
  @Type(() => Number)
  userId!: number;
}
