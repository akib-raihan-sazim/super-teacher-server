import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Message } from "@/common/entities/messages.entity";
import { User } from "@/common/entities/users.entity";
import { CreateMessageDto } from "@/messages/messages.dtos";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createClassroomInDb } from "../utils/helpers/create-classroom-in-db.helpers";
import { createTeacherInDb, createStudentInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";

describe("MessagesController (e2e)", () => {
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

  describe("POST /messages", () => {
    let teacherUser: User;
    let teacherToken: string;
    let classroom: Classroom;
    let messageDto: CreateMessageDto;

    beforeEach(async () => {
      const {
        user: teacherUserData,
        teacher,
        plainTextPassword: teacherPassword,
      } = await UserFactory.createTeacher();
      teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
      teacherToken = await getAccessToken(httpServer, teacherUser.email, teacherPassword);

      classroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      messageDto = {
        content: "Test message content",
        classroomId: classroom.id,
      };
    });

    it("should create a message successfully", async () => {
      const response = await request(httpServer)
        .post("/messages")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(messageDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        content: messageDto.content,
        classroom: expect.objectContaining({ id: classroom.id }),
        sender: expect.objectContaining({ id: teacherUser.id }),
      });

      const createdMessage = await dbService.findOne(Message, { id: response.body.id });
      expect(createdMessage).toBeDefined();
      expect(createdMessage?.attachmentUrl).toBeNull();
    });

    it("should return 400 Bad Request when required fields are missing", async () => {
      const invalidMessageDto = { content: messageDto.content };
      await request(httpServer)
        .post("/messages")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidMessageDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer).post("/messages").send(messageDto).expect(HttpStatus.UNAUTHORIZED);
    });

    it("should allow a student to create a message", async () => {
      const {
        user: studentUserData,
        student,
        plainTextPassword: studentPassword,
      } = await UserFactory.createStudent();
      const studentUser = await createStudentInDb(dbService, studentUserData, student);
      const studentToken = await getAccessToken(httpServer, studentUser.email, studentPassword);

      const response = await request(httpServer)
        .post("/messages")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(messageDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        content: messageDto.content,
        classroom: expect.objectContaining({ id: classroom.id }),
        sender: expect.objectContaining({ id: studentUser.id }),
      });
    });
  });

  describe("GET classroom/:classroomId/messages", () => {
    let teacherUser: User;
    let teacherToken: string;
    let classroom: Classroom;
    let messageDto: CreateMessageDto;

    beforeEach(async () => {
      const {
        user: teacherUserData,
        teacher,
        plainTextPassword: teacherPassword,
      } = await UserFactory.createTeacher();
      teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
      teacherToken = await getAccessToken(httpServer, teacherUser.email, teacherPassword);

      classroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      messageDto = {
        content: "Test message content",
        classroomId: classroom.id,
      };

      await request(httpServer)
        .post("/messages")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(messageDto)
        .expect(HttpStatus.CREATED);
    });

    it("should retrieve messages for the classroom", async () => {
      const response = await request(httpServer)
        .get(`/messages/classroom/${classroom.id}/messages`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        content: messageDto.content,
        classroom: expect.objectContaining({ id: classroom.id }),
        sender: expect.objectContaining({ id: teacherUser.id }),
      });
    });

    it("should return an empty array if no messages exist for the classroom", async () => {
      const newClassroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      const response = await request(httpServer)
        .get(`/messages/classroom/${newClassroom.id}/messages`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(0);
    });

    it("should return 404 if classroom does not exist", async () => {
      const nonExistentClassroomId = 9999;

      await request(httpServer)
        .get(`/messages/classroom/${nonExistentClassroomId}/messages`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
