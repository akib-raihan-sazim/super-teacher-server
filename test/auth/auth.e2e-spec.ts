import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import type { IDatabaseDriver, Connection, EntityManager, MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { faker } from "@faker-js/faker";
import request from "supertest";

import { AuthModule } from "@/auth/auth.module";
import { Permissions } from "@/auth/decorators/permissions.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/auth/guards/permissions.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { EPermission, EUserRole } from "@/common/enums/roles.enums";
import ormConfig from "@/db/db.config";
import { RolesModule } from "@/roles/roles.module";
import { RolesService } from "@/roles/roles.service";
import { UsersModule } from "@/users/users.module";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";
import { seedPermissionsData } from "./auth.helpers";
import { MOCK_AUTH_EMAIL, MOCK_AUTH_PASS } from "./auth.mock";

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
    await seedPermissionsData(dbService);
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  describe("Authentication", () => {
    beforeAll(async () => {
      await createUserInDb(dbService);
    });

    describe("POST /auth/login", () => {
      it("should return 201 Created with proper credentials", () =>
        request(httpServer)
          .post("/auth/login")
          .send(`email=${MOCK_AUTH_EMAIL}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) => {
            expect(body.data.user.email).toEqual(MOCK_AUTH_EMAIL);
            expect(body.data).toHaveProperty("accessToken");
            expect(body.data.user.password).toBeUndefined();
          }));

      it("should return 401 Unauthorized with wrong credentials", () =>
        request(httpServer)
          .post("/auth/login")
          .send(`email=${MOCK_AUTH_EMAIL}&password=wrongpassword`)
          .expect(HttpStatus.UNAUTHORIZED));

      it("Without authentication params, gets back 401 Unauthenticated", () =>
        request(httpServer).post("/auth/login").expect(HttpStatus.UNAUTHORIZED));
    });
  });

  describe("Authorization", () => {
    let authorizationApp: INestApplication;
    let authorizationHttpServer: Awaited<
      ReturnType<typeof bootstrapTestServer>
    >["httpServerInstance"];

    beforeAll(async () => {
      @Controller("dummy")
      class DummyController {
        @Get("/requires-login")
        @UseGuards(JwtAuthGuard)
        public requiresLogin() {
          return "You're logged in!";
        }

        @Get("/requires-specific-role")
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(EUserRole.SUPER_USER)
        public requiresSpecificRole() {
          return "You have the required role!";
        }

        @Get("/requires-specific-permission")
        @UseGuards(JwtAuthGuard, PermissionsGuard)
        @Permissions(EPermission.DELETE_USER)
        public requiresSpecificPermission() {
          return "You have the required permission!";
        }
      }

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [MikroOrmModule.forRoot(ormConfig), UsersModule, AuthModule, RolesModule],
        controllers: [DummyController],
        providers: [RolesService],
      }).compile();

      authorizationApp = moduleFixture.createNestApplication();
      authorizationApp.useGlobalPipes(new ValidationPipe({ transform: true }));
      authorizationHttpServer = authorizationApp.getHttpServer();
      await authorizationApp.init();
    });

    afterAll(async () => {
      await authorizationHttpServer.close();
      await authorizationApp.close();
    });

    describe("GET /dummy/requires-login", () => {
      it("should return 401 Unauthorized without proper token", () =>
        request(authorizationHttpServer)
          .get("/dummy/requires-login")
          .expect(HttpStatus.UNAUTHORIZED));

      it("should return 200 OK with proper token", async () => {
        const email = faker.internet.email();
        await createUserInDb(dbService, {
          email,
        });

        const { body } = await request(authorizationHttpServer)
          .post("/auth/login")
          .send(`email=${MOCK_AUTH_EMAIL}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED);

        return request(authorizationHttpServer)
          .get("/dummy/requires-login")
          .set("Authorization", `Bearer ${body.data.accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ text }) => expect(text).toEqual("You're logged in!"));
      });
    });

    describe("GET /dummy/requires-specific-permission", () => {
      it("should return 403 Forbidden with proper token but without permission", async () => {
        const email = faker.internet.email();

        await createUserInDb(dbService, {
          email,
          role: EUserRole.ADMIN,
        });

        const { body } = await request(authorizationHttpServer)
          .post("/auth/login")
          .send(`email=${email}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED);

        return request(authorizationHttpServer)
          .get("/dummy/requires-specific-permission")
          .set("Authorization", `Bearer ${body.data.accessToken}`)
          .expect(HttpStatus.FORBIDDEN)
          .expect(({ body }) => expect(body.message).toEqual("Forbidden resource"));
      });

      it("should return 200 OK with proper token and permission", async () => {
        const email = faker.internet.email();

        await createUserInDb(dbService, {
          email,
          role: EUserRole.SUPER_USER,
        });

        const { body } = await request(authorizationHttpServer)
          .post("/auth/login")
          .send(`email=${email}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED);

        return request(authorizationHttpServer)
          .get("/dummy/requires-specific-permission")
          .set("Authorization", `Bearer ${body.data.accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ text }) => expect(text).toEqual("You have the required permission!"));
      });
    });

    describe("GET /dummy/requires-specific-role", () => {
      it("should return 403 Forbidden with proper token but without role", async () => {
        const email = faker.internet.email();

        await createUserInDb(dbService, {
          email,
          role: EUserRole.ADMIN,
        });

        const { body } = await request(authorizationHttpServer)
          .post("/auth/login")
          .send(`email=${email}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED);

        return request(authorizationHttpServer)
          .get("/dummy/requires-specific-role")
          .set("Authorization", `Bearer ${body.data.accessToken}`)
          .expect(HttpStatus.FORBIDDEN)
          .expect(({ body }) => expect(body.message).toEqual("Forbidden resource"));
      });

      it("should return 200 OK with proper token and role", async () => {
        const email = faker.internet.email();

        await createUserInDb(dbService, {
          email,
          role: EUserRole.SUPER_USER,
        });

        const { body } = await request(authorizationHttpServer)
          .post("/auth/login")
          .send(`email=${email}&password=${MOCK_AUTH_PASS}`)
          .expect(HttpStatus.CREATED);

        return request(authorizationHttpServer)
          .get("/dummy/requires-specific-role")
          .set("Authorization", `Bearer ${body.data.accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ text }) => expect(text).toEqual("You have the required role!"));
      });
    });
  });
});
