import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { UniqueCode } from "@/common/entities/unique_codes.entity";
import { User } from "@/common/entities/users.entity";
import { EUserType } from "@/common/enums/users.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import {
  createStudentRegistrationData,
  createTeacherRegistrationData,
  createUniqueCode,
  createUser,
} from "../utils/helpers/auth.helpers";
import { THttpServer } from "../utils/types";

describe("AuthController (e2e)", () => {
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

  afterEach(() => {
    dbService.clear();
  });

  describe("POST /auth/login", () => {
    const password = "password123";
    let user: User;

    beforeEach(async () => {
      user = await createUser(dbService);
    });

    it("logs in a user and returns CREATED(201) with auth token", async () => {
      const response = await request(httpServer)
        .post("/auth/login")
        .send({ email: user.email, password })
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("returns UNAUTHORIZED(401) when the credentials are invalid", async () => {
      await request(httpServer)
        .post("/auth/login")
        .send({ email: user.email, password: "wrong-password" })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /auth/register/student", () => {
    let studentData: ReturnType<typeof createStudentRegistrationData>;

    beforeEach(() => {
      studentData = createStudentRegistrationData();
    });

    it("registers a student and returns CREATED(201) with auth token", async () => {
      const response = await request(httpServer)
        .post("/auth/register/student")
        .send(studentData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");

      const createdUser = await dbService.findOne(User, { email: studentData.email });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(studentData.email);
      expect(createdUser?.userType).toBe(EUserType.STUDENT);
    });

    it("returns BAD_REQUEST(400) when required fields are missing", async () => {
      const { educationLevel: _educationLevel, ...dataWithoutEducationLevel } = studentData;
      await request(httpServer)
        .post("/auth/register/student")
        .send(dataWithoutEducationLevel)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("returns CONFLICT(409) when email is already in use", async () => {
      await request(httpServer)
        .post("/auth/register/student")
        .send(studentData)
        .expect(HttpStatus.CREATED);

      await request(httpServer)
        .post("/auth/register/student")
        .send(studentData)
        .expect(HttpStatus.CONFLICT);
    });
  });
  describe("POST /auth/register/teacher", () => {
    let teacherData: ReturnType<typeof createTeacherRegistrationData>;

    beforeEach(() => {
      teacherData = createTeacherRegistrationData();
    });

    it("registers a teacher and returns CREATED(201) with auth token", async () => {
      await createUniqueCode(dbService, teacherData.email, teacherData.uniqueCode);

      const response = await request(httpServer)
        .post("/auth/register/teacher")
        .send(teacherData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");

      const createdUser = await dbService.findOne(User, { email: teacherData.email });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(teacherData.email);
      expect(createdUser?.userType).toBe(EUserType.TEACHER);

      const updatedUniqueCode = await dbService.findOne(UniqueCode, { email: teacherData.email });
      expect(updatedUniqueCode?.usageCount).toBe(1);
    });

    it("returns BAD_REQUEST(400) when required fields are missing", async () => {
      const { highestEducationLevel: _, ...dataWithoutHighestEducationLevel } = teacherData;

      await request(httpServer)
        .post("/auth/register/teacher")
        .send(dataWithoutHighestEducationLevel)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("returns CONFLICT(409) when email is already in use", async () => {
      await createUniqueCode(dbService, teacherData.email, teacherData.uniqueCode);

      await request(httpServer)
        .post("/auth/register/teacher")
        .send(teacherData)
        .expect(HttpStatus.CREATED);

      const response = await request(httpServer)
        .post("/auth/register/teacher")
        .send(teacherData)
        .expect(HttpStatus.CONFLICT);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Email already in use");
    });

    it("returns BAD_REQUEST(400) when unique code is invalid", async () => {
      const response = await request(httpServer)
        .post("/auth/register/teacher")
        .send(teacherData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Invalid unique code");
    });

    it("returns BAD_REQUEST(400) when unique code has been used 3 times", async () => {
      const uniqueCode = await createUniqueCode(
        dbService,
        teacherData.email,
        teacherData.uniqueCode,
      );
      uniqueCode.usageCount = 3;
      await dbService.persistAndFlush(uniqueCode);

      const response = await request(httpServer)
        .post("/auth/register/teacher")
        .send(teacherData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain(
        "Unique code has expired. Please generate a new code.",
      );
    });

    it("increments usage count and returns BAD_REQUEST(400) when unique code is valid but email is incorrect", async () => {
      const validEmail = "valid-email@example.com";
      const teacherData = createTeacherRegistrationData();
      await createUniqueCode(dbService, validEmail, teacherData.uniqueCode);

      const incorrectEmailData = { ...teacherData, email: "wrong-email@example.com" };

      const response = await request(httpServer)
        .post("/auth/register/teacher")
        .send(incorrectEmailData)
        .expect(HttpStatus.BAD_REQUEST);

      const updatedUniqueCode = await dbService.findOne(UniqueCode, { email: validEmail });
      expect(updatedUniqueCode).toBeDefined();
      expect(updatedUniqueCode?.usageCount).toBe(1);

      expect(response.body).toHaveProperty("message", "Invalid unique code");
      expect(response.body).toHaveProperty("usageCount", 1);
      expect(response.body).toHaveProperty("remainingUses", 2);
    });
  });
});
