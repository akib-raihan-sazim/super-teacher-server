import { ClassSerializerInterceptor, Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR, Reflector } from "@nestjs/core";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OpenTelemetryModule } from "@metinseylan/nestjs-opentelemetry";

import { AuthModule } from "./auth/auth.module";
import { ClassroomsModule } from "./classrooms/classrooms.module";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import ormConfig from "./db/db.config";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { MailModule } from "./mail/mail.module";
import { MessagesModule } from "./messages/messages.module";
import { StudentsModule } from "./students/students.module";
import { UniqueCodeModule } from "./unique-code/unique-code.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig),

    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      envFilePath: [".env.development.local"],
    }),

    OpenTelemetryModule.forRoot({
      serviceName: "Project Backend",
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
    UniqueCodeModule,
    ClassroomsModule,
    EnrollmentsModule,
    MailModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    Reflector,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
