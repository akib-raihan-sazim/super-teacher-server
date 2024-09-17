import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { FirebaseService } from "@/firebase/firebase.service";

import { FileUploadsService } from "./file-uploads.service";

@Module({
  imports: [ConfigModule],
  providers: [
    FileUploadsService,
    FirebaseService,
    {
      provide: "FIREBASE_CONFIG",
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>("FIREBASE_API_KEY"),
        authDomain: configService.get<string>("FIREBASE_AUTH_DOMAIN"),
        projectId: configService.get<string>("FIREBASE_PROJECT_ID"),
        storageBucket: configService.get<string>("FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: configService.get<string>("FIREBASE_MESSAGING_SENDER_ID"),
        appId: configService.get<string>("FIREBASE_APP_ID"),
        measurementId: configService.get<string>("FIREBASE_MEASUREMENT_ID"),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [FileUploadsService, FirebaseService],
})
export class FileUploadsModule {}
