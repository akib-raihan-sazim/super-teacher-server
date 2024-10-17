import { EntityManager } from "@mikro-orm/core";

import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";

import { User } from "@/common/entities/users.entity";
import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

export const hashPassword = async (password: string): Promise<string> => {
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
};

export const createUser = async (
  dbService: EntityManager,
  userType: EUserType = EUserType.STUDENT,
): Promise<User> => {
  const user = dbService.create(User, {
    email: faker.internet.email(),
    password: await hashPassword("password123"),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    gender: faker.person.gender(),
    userType: userType,
  });
  await dbService.persistAndFlush(user);
  return user;
};

export const createStudentRegistrationData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: "password123",
  gender: faker.person.gender(),
  userType: EUserType.STUDENT,
  educationLevel: EEducationLevel.COLLEGE,
  phoneNo: faker.phone.number(),
  address: faker.location.streetAddress(),
  medium: EMedium.ENGLISH,
  class: "10",
});
