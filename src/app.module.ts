import { Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OpenTelemetryModule } from "@metinseylan/nestjs-opentelemetry";

import { AuthModule } from "./auth/auth.module";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import ormConfig from "./db/db.config";
import { StudentsModule } from "./students/students.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig),

    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
    }),

    OpenTelemetryModule.forRoot({
      serviceName: "Project Backend",
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
