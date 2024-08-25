import { NestFactory } from "@nestjs/core";

import { CommandFactory } from "nest-commander";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  await CommandFactory.run(AppModule, ["warn", "error"]);
}

bootstrap();
