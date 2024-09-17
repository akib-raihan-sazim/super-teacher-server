import { Classroom } from "@/common/entities/classrooms.entity";

export class CreateResourceDto {
  title!: string;
  fileUrl!: string;
  classroom!: Classroom;
}
