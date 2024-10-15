import { EntityManager } from "@mikro-orm/core";

import { faker } from "@faker-js/faker";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";
import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

export class UserFactory {
  static async createStudent(
    em: EntityManager,
    educationLevel: EEducationLevel = EEducationLevel.SCHOOL,
  ): Promise<User> {
    const user = em.create(User, {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      gender: faker.person.gender(),
      userType: EUserType.STUDENT,
    });

    const studentData: Omit<Student, "id" | "createdAt" | "updatedAt"> = {
      educationLevel,
      phoneNo: faker.phone.number(),
      address: faker.location.streetAddress(),
      user,
      medium: EMedium.ENGLISH,
      class: "10",
      degree: undefined,
      degreeName: undefined,
      semester: undefined,
    };

    if (educationLevel === EEducationLevel.SCHOOL || educationLevel === EEducationLevel.COLLEGE) {
      studentData.medium = faker.helpers.arrayElement(Object.values(EMedium));
      studentData.class = faker.helpers.arrayElement(["8", "9", "10", "11", "12"]);
    } else if (educationLevel === EEducationLevel.UNIVERSITY) {
      studentData.medium = EMedium.NONE;
      studentData.class = undefined;
      studentData.degree = faker.helpers.arrayElement(["Bachelor", "Master"]);
      studentData.degreeName = faker.helpers.arrayElement([
        "Computer Science",
        "Economics",
        "Business Administration",
        "Electrical Engineering",
      ]);
      studentData.semester = faker.helpers.arrayElement(["1", "2", "3", "4", "5", "6", "7", "8"]);
    }

    const student = em.create(Student, studentData);
    user.student = student;

    await em.persistAndFlush([user, student]);
    return user;
  }

  static async createTeacher(em: EntityManager): Promise<User> {
    const user = em.create(User, {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: await faker.internet.password(),
      gender: faker.person.gender(),
      userType: EUserType.TEACHER,
    });

    const teacherData: Omit<Teacher, "id" | "createdAt" | "updatedAt"> = {
      highestEducationLevel: faker.helpers.arrayElement(["Bachelors", "Masters", "PhD"]),
      majorSubject: faker.helpers.arrayElement([
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
      ]),
      subjectsToTeach: faker.helpers.arrayElements(
        ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
        { min: 1, max: 3 },
      ),
      user,
    };

    const teacher = em.create(Teacher, teacherData);
    user.teacher = teacher;

    await em.persistAndFlush([user, teacher]);
    return user;
  }
}
