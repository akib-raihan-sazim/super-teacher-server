import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { User } from "@/common/entities/users.entity";
import { EEducationLevel } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createUser } from "../utils/helpers/auth.helpers";
import { createStudentInDb, createTeacherInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";

describe("UsersController (e2e)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
  });

  describe("GET /users/user-details", () => {
    it("should return correct details for a school student", async () => {
      const { user, student, plainTextPassword } = await UserFactory.createStudent(
        EEducationLevel.SCHOOL,
      );
      const createdUser = await createStudentInDb(dbService, user, student);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "student",
          student: expect.objectContaining({
            educationLevel: EEducationLevel.SCHOOL,
            medium: expect.any(String),
            class: expect.any(String),
            phoneNo: expect.any(String),
            address: expect.any(String),
          }),
        }),
      );

      expect(response.body.student).not.toHaveProperty("degree");
      expect(response.body.student).not.toHaveProperty("degreeName");
      expect(response.body.student).not.toHaveProperty("semester");
    });

    it("should return correct details for a university student", async () => {
      const { user, student, plainTextPassword } = await UserFactory.createStudent(
        EEducationLevel.UNIVERSITY,
      );
      const createdUser = await createStudentInDb(dbService, user, student);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "student",
          student: expect.objectContaining({
            educationLevel: EEducationLevel.UNIVERSITY,
            degree: expect.any(String),
            degreeName: expect.any(String),
            semester: expect.any(String),
            phoneNo: expect.any(String),
            address: expect.any(String),
          }),
        }),
      );

      expect(response.body.student).not.toHaveProperty("class");
    });

    it("should return correct details for a teacher", async () => {
      const { user, teacher, plainTextPassword } = await UserFactory.createTeacher();
      const createdUser = await createTeacherInDb(dbService, user, teacher);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "teacher",
          teacher: expect.objectContaining({
            highestEducationLevel: expect.any(String),
            majorSubject: expect.any(String),
            subjectsToTeach: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );

      expect(response.body).not.toHaveProperty("student");
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer).get("/users/user-details").expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 Unauthorized when an invalid token is provided", async () => {
      await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", "Bearer invalidtoken")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("PUT /users/reset-password", () => {
    let user: User;
    let token: string;
    const oldPassword = "password123";
    const newPassword = "newPassword123";

    beforeEach(async () => {
      user = await createUser(dbService, EUserType.STUDENT);
      token = await getAccessToken(httpServer, user.email, oldPassword);
    });

    it("should reset password successfully", async () => {
      await request(httpServer)
        .put("/users/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect(HttpStatus.OK);
    });

    it("should return 401 Unauthorized when old password is incorrect", async () => {
      const response = await request(httpServer)
        .put("/users/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: "incorrectOldPassword",
          newPassword: newPassword,
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toBe("Old password is incorrect");
    });

    it("should return 400 Bad Request when new password is the same as old password", async () => {
      const response = await request(httpServer)
        .put("/users/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: oldPassword,
          newPassword: oldPassword,
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe("Cannot set a previously used password");
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer)
        .put("/users/reset-password")
        .send({
          oldPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 400 Bad Request when required fields are missing", async () => {
      await request(httpServer)
        .put("/users/reset-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: oldPassword,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
