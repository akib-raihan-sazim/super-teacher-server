import { ClassSerializerInterceptor, Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR, Reflector } from "@nestjs/core";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OpenTelemetryModule } from "@metinseylan/nestjs-opentelemetry";

import { AssignmentsModule } from "./assignments/assignments.module";
import { AuthModule } from "./auth/auth.module";
import { ClassroomsModule } from "./classrooms/classrooms.module";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import ormConfig from "./db/db.config";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { ExamsModule } from "./exams/exams.module";
import { FileUploadsModule } from "./file-uploads/file-uploads.module";
import { MailModule } from "./mail/mail.module";
import { MessagesModule } from "./messages/messages.module";
import { RealtimeMessagingModule } from "./realtime-messaging/realtime-messaging.module";
import { ResourcesModule } from "./resources/resources.module";
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
    RealtimeMessagingModule,
    FileUploadsModule,
    ResourcesModule,
    ExamsModule,
    AssignmentsModule,
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
