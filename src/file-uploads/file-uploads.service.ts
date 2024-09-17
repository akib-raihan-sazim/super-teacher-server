import { Injectable, HttpException, HttpStatus } from "@nestjs/common";

import { FirebaseService } from "@/firebase/firebase.service";

import { ALLOWED_MIME_TYPES } from "./file-uploads.constants";

@Injectable()
export class FileUploadsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async uploadFile(file: Express.Multer.File, filename: string): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        "Invalid file type. Only PDF, PNG, JPG, and DOC files are allowed.",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const fileUrl = await this.firebaseService.uploadFile(file, filename);
      return fileUrl;
    } catch (error) {
      throw new HttpException("Failed to upload file", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
