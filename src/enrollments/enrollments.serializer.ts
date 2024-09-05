import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";
import { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class EnrollmentSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: [],
    populate: ["student", "student.user"],
  };

  protected serializeManyOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: [
      "createdAt",
      "updatedAt",
      "student.createdAt",
      "student.updatedAt",
      "student.educationLevel",
      "student.phoneNo",
      "student.address",
      "student.medium",
      "student.user.password",
      "student.user.createdAt",
      "student.user.updatedAt",
      "student.user.student",
      "student.user.userType",
      "student.user.id",
      "classroom",
    ],
    populate: ["student", "student.user"],
  };
}
