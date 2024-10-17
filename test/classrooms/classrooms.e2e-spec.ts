import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Enrollment } from "@/common/entities/enrollments.entity";
import { User } from "@/common/entities/users.entity";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { ClassroomFactory } from "../utils/factories/classrooms.factory";
import { UserFactory } from "../utils/factories/users.factory";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createClassroomInDb } from "../utils/helpers/create-classroom-in-db.helpers";
import { createTeacherInDb, createStudentInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";

describe("ClassroomsController (e2e)", () => {
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

  describe("POST /classrooms", () => {
    let teacherUser: User;
    let teacherToken: string;
    let studentUser: User;
    let studentToken: string;
    let classroomDto: ReturnType<typeof ClassroomFactory.createClassroomDto>;

    beforeEach(async () => {
      const {
        user: teacherUserData,
        teacher,
        plainTextPassword: teacherPassword,
      } = await UserFactory.createTeacher();
      teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
      teacherToken = await getAccessToken(httpServer, teacherUser.email, teacherPassword);

      const {
        user: studentUserData,
        student,
        plainTextPassword: studentPassword,
      } = await UserFactory.createStudent();
      studentUser = await createStudentInDb(dbService, studentUserData, student);
      studentToken = await getAccessToken(httpServer, studentUser.email, studentPassword);

      classroomDto = ClassroomFactory.createClassroomDto();
    });

    it("should create a classroom successfully when teacher is authenticated", async () => {
      const response = await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(classroomDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: classroomDto.title,
          subject: classroomDto.subject,
          days: classroomDto.days,
          userId: teacherUser.id,
        }),
      );

      expect(Date.parse(response.body.classTime)).not.toBeNaN();
    });

    it("should return 403 Forbidden when student tries to create a classroom", async () => {
      await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(classroomDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer)
        .post("/classrooms")
        .send(classroomDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 400 Bad Request when required fields are missing", async () => {
      const { subject: _, ...invalidClassroomDto } = classroomDto;
      await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidClassroomDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /classrooms/:id", () => {
    let teacherUser: User;
    let teacherToken: string;
    let classroom: Classroom;

    beforeEach(async () => {
      const {
        user: teacherUserData,
        teacher,
        plainTextPassword: teacherPassword,
      } = await UserFactory.createTeacher();
      teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
      teacherToken = await getAccessToken(httpServer, teacherUser.email, teacherPassword);

      const classroomDto = ClassroomFactory.createClassroomDto();

      classroom = await createClassroomInDb(dbService, teacherUser.teacher!, classroomDto);
    });

    it("should get classroom by ID successfully when teacher is authenticated", async () => {
      const response = await request(httpServer)
        .get(`/classrooms/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: classroom.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        title: classroom.title,
        subject: classroom.subject,
        classTime: classroom.classTime.toISOString(),
        days: classroom.days,
        teacher: {
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          highestEducationLevel: teacherUser.teacher?.highestEducationLevel,
          majorSubject: teacherUser.teacher?.majorSubject,
          subjectsToTeach: teacherUser.teacher?.subjectsToTeach,
          user: {
            id: teacherUser.id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            firstName: teacherUser.firstName,
            lastName: teacherUser.lastName,
            email: teacherUser.email,
            gender: teacherUser.gender,
            userType: teacherUser.userType,
          },
        },
      });
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer).get(`/classrooms/${classroom.id}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 404 Not Found when classroom doesn't exist", async () => {
      const nonExistentId = 9999;
      await request(httpServer)
        .get(`/classrooms/${nonExistentId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("GET /classrooms/:id/students", () => {
    let teacherUser: User;
    let teacherToken: string;
    let classroom: Classroom;
    let enrolledStudents: User[];

    beforeEach(async () => {
      const {
        user: teacherUserData,
        teacher,
        plainTextPassword,
      } = await UserFactory.createTeacher();
      teacherUser = await createTeacherInDb(dbService, teacherUserData, teacher);
      teacherToken = await getAccessToken(httpServer, teacherUser.email, plainTextPassword);

      classroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      const studentData = await Promise.all([
        UserFactory.createStudent(),
        UserFactory.createStudent(),
        UserFactory.createStudent(),
      ]);

      enrolledStudents = await Promise.all(
        studentData.map(async ({ user, student }) => {
          const createdUser = await createStudentInDb(dbService, user, student);
          const enrollment = dbService.create(Enrollment, {
            student: createdUser.student!,
            classroom: classroom,
          });
          await dbService.persistAndFlush(enrollment);
          return createdUser;
        }),
      );
    });

    it("should get students for classroom successfully", async () => {
      const response = await request(httpServer)
        .get(`/classrooms/${classroom.id}/students`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(enrolledStudents.length);
      expect(response.body).toEqual(
        expect.arrayContaining(
          enrolledStudents.map((_student) =>
            expect.objectContaining({
              id: expect.any(Number),
              student: expect.objectContaining({
                id: expect.any(Number),
                address: expect.any(String),
                class: expect.any(String),
                educationLevel: expect.any(String),
                medium: expect.any(String),
                phoneNo: expect.any(String),
                user: expect.objectContaining({
                  id: expect.any(Number),
                  firstName: expect.any(String),
                  lastName: expect.any(String),
                  email: expect.any(String),
                  gender: expect.any(String),
                  userType: "student",
                }),
              }),
            }),
          ),
        ),
      );

      const responseStudentIds = response.body.map(
        (enrollment: { student: { user: { id: number } } }) => enrollment.student.user.id,
      );
      const enrolledStudentIds = enrolledStudents.map((student) => student.id);
      expect(responseStudentIds).toEqual(expect.arrayContaining(enrolledStudentIds));
    });

    it("should return an empty array for a classroom with no students", async () => {
      const emptyClassroom = await createClassroomInDb(dbService, teacherUser.teacher!);

      const response = await request(httpServer)
        .get(`/classrooms/${emptyClassroom.id}/students`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual([]);
    });

    it("should return 404 Not Found for a non-existent classroom", async () => {
      const nonExistentId = 9999;

      await request(httpServer)
        .get(`/classrooms/${nonExistentId}/students`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer)
        .get(`/classrooms/${classroom.id}/students`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
