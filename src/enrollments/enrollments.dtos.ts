import { IsNumber } from "class-validator";

export class CreateEnrollmentDto {
  @IsNumber()
  studentId!: number;

  @IsNumber()
  classroomId!: number;
}

export class EnrollmentResponseDto {
  @IsNumber()
  id!: number;

  @IsNumber()
  studentId!: number;

  @IsNumber()
  classroomId!: number;

  constructor(id: number, studentId: number, classroomId: number) {
    this.id = id;
    this.studentId = studentId;
    this.classroomId = classroomId;
  }
}
