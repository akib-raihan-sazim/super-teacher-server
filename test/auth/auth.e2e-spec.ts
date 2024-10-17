import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { User } from "@/common/entities/users.entity";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUser } from "../utils/helpers/auth.helpers";
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
});
