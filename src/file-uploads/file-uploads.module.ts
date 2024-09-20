import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { S3, S3Client } from "@aws-sdk/client-s3";

import { S3Service } from "@/common/aws/s3-service/s3-service";
import { isLocal } from "@/utils/env";

import { FileUploadsService } from "./file-uploads.service";

@Module({
  providers: [
    FileUploadsService,
    {
      provide: S3Service,
      useFactory: (config: ConfigService) => {
        const isLocalEnv = isLocal(config.get("NODE_ENV"));

        const bucketName = config.get("AWS_S3_BUCKET_NAME");
        const region = config.get("AWS_S3_REGION");
        const endpoint = config.get("AWS_S3_ENDPOINT");

        const credentials = {
          accessKeyId: config.get("AWS_ACCESS_KEY_ID"),
          secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY"),
        };

        return new S3Service(
          new S3({ region, endpoint, forcePathStyle: isLocalEnv, credentials }),
          new S3Client({
            region,
            endpoint,
            forcePathStyle: isLocalEnv,
            credentials,
          }),
          bucketName,
          config,
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [FileUploadsService, S3Service],
})
export class FileUploadsModule {}
