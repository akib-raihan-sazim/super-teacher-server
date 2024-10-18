import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Exam } from "@/common/entities/exams.entity";
import { User } from "@/common/entities/users.entity";
import { CreateExamDto } from "@/exams/exams.dtos";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createClassroomInDb } from "../utils/helpers/create-classroom-in-db.helpers";
import { createExamInDb } from "../utils/helpers/create-exam-in-db.helpers";
import { createStudentInDb, createTeacherInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";

describe("ExamsController (e2e)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;
  let teacherUser: User;
  let teacherToken: string;
  let classroom: Classroom;

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
    const {
      user: teacherUserData,
      teacher,
      plainTextPassword: teacherPassword,
    } = await UserFactory.createTeacher();
    teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
    teacherToken = await getAccessToken(httpServer, teacherUser.email, teacherPassword);

    classroom = await createClassroomInDb(dbService, teacherUser.teacher!);

    await createExamInDb(dbService, classroom, {
      title: "Midterm Exam",
      instruction: "Complete the exam.",
      date: new Date(),
    });
    await createExamInDb(dbService, classroom, {
      title: "Final Exam",
      instruction: "Complete all questions.",
      date: new Date(),
    });
  });

  describe("POST /:classroomId/exams", () => {
    it("should create an exam successfully for the classroom", async () => {
      const createExamDto: CreateExamDto = {
        title: "Midterm Exam",
        instruction: "Please solve all questions carefully.",
        date: new Date(),
      };

      const response = await request(httpServer)
        .post(`/classrooms/${classroom.id}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(createExamDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        title: createExamDto.title,
        instruction: createExamDto.instruction,
        date: createExamDto.date.toISOString(),
        classroom: expect.objectContaining({ id: classroom.id }),
      });

      const createdExam = await dbService.findOne(Exam, { id: response.body.id });
      expect(createdExam).toBeDefined();
      expect(createdExam?.title).toBe(createExamDto.title);
      expect(createdExam?.instruction).toBe(createExamDto.instruction);
    });

    it("should return 403 Forbidden when a non-teacher tries to create an exam", async () => {
      const {
        user: studentUserData,
        student,
        plainTextPassword: studentPassword,
      } = await UserFactory.createStudent();
      const studentUser = await createStudentInDb(dbService, studentUserData, student);
      const studentToken = await getAccessToken(httpServer, studentUser.email, studentPassword);

      const createExamDto: CreateExamDto = {
        title: "Midterm Exam",
        instruction: "Please solve all questions carefully.",
        date: new Date(),
      };
      await request(httpServer)
        .post(`/classrooms/${classroom.id}/exams`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(createExamDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("should return 404 Not Found when the classroom does not exist", async () => {
      const createExamDto: CreateExamDto = {
        title: "Midterm Exam",
        instruction: "Please solve all questions carefully.",
        date: new Date(),
      };

      const nonExistentClassroomId = 9999;

      await request(httpServer)
        .post(`/classrooms/${nonExistentClassroomId}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(createExamDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("should return 400 Bad Request when required fields are missing", async () => {
      const createExamDto = {
        instruction: "Please solve all questions carefully.",
      };

      await request(httpServer)
        .post(`/classrooms/${classroom.id}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(createExamDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /classroom/:classroomId/exams", () => {
    it("should retrieve exams for the given classroom", async () => {
      const response = await request(httpServer)
        .get(`/classrooms/${classroom.id}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.length).toBe(2);
      expect(response.body[0]).toMatchObject({
        title: expect.any(String),
        instruction: expect.any(String),
        date: expect.any(String),
        classroom: expect.objectContaining({ id: classroom.id }),
      });
    });

    it("should return an empty array if no exams are found", async () => {
      const newClassroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      const response = await request(httpServer)
        .get(`/classrooms/${newClassroom.id}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual([]);
    });

    it("should return 404 Not Found for a non-existent classroom", async () => {
      const nonExistentClassroomId = 9999;

      await request(httpServer)
        .get(`/classrooms/${nonExistentClassroomId}/exams`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer)
        .get(`/classrooms/${classroom.id}/exams`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should allow a student to retrieve exams for their classroom", async () => {
      const {
        user: studentUserData,
        student,
        plainTextPassword: studentPassword,
      } = await UserFactory.createStudent();
      const studentUser = await createStudentInDb(dbService, studentUserData, student);
      const studentToken = await getAccessToken(httpServer, studentUser.email, studentPassword);

      const response = await request(httpServer)
        .get(`/classrooms/${classroom.id}/exams`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.length).toBe(2);
    });
  });
});
