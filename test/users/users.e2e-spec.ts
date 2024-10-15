import { HttpStatus, INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { EEducationLevel } from "@/common/enums/students.enums";

import { AppModule } from "../../src/app.module";
import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { THttpServer } from "../utils/types";

describe("UsersController (e2e)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    jwtService = moduleFixture.get<JwtService>(JwtService);
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
      const user = await UserFactory.createStudent(dbService, EEducationLevel.SCHOOL);
      const token = jwtService.sign({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        userType: user.userType,
      });

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
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
      const user = await UserFactory.createStudent(dbService, EEducationLevel.UNIVERSITY);
      const token = jwtService.sign({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        userType: user.userType,
      });

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
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
      const user = await UserFactory.createTeacher(dbService);
      const token = jwtService.sign({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        userType: user.userType,
      });

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
          gender: expect.any(String),
          userType: "teacher",
          teacher: expect.objectContaining({
            id: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            highestEducationLevel: expect.any(String),
            majorSubject: expect.any(String),
            subjectsToTeach: expect.arrayContaining([expect.any(String)]),
            user: expect.objectContaining({
              id: expect.any(Number),
            }),
          }),
        }),
      );

      expect(response.body).not.toHaveProperty("student");
      expect(response.body).not.toHaveProperty("password");
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
});
