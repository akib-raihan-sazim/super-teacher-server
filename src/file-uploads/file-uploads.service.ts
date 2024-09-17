import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { randomUUID } from "crypto";

import { S3Service } from "@/common/aws/s3-service/s3-service";

import { ALLOWED_MIME_TYPES } from "./file-uploads.constants";

@Injectable()
export class FileUploadsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async getPresignedUrl(file: Express.Multer.File) {
    file.originalname = `${randomUUID()}-${new Date().getTime()}-${file.originalname}`;
    const { originalname, mimetype } = file;
    if (ALLOWED_MIME_TYPES.indexOf(mimetype) === -1) {
      throw new HttpException("Invalid file type", HttpStatus.BAD_REQUEST);
    }
    const signedUrl = await this.s3Service.getPresignedUrl(originalname, mimetype);
    return signedUrl;
  }

  async uploadToS3(url: string, file: Express.Multer.File) {
    const response = await fetch(url, {
      method: "PUT",
      body: file.buffer,
      headers: {
        "Content-Type": file.mimetype,
      },
    });
    return response;
  }
}
