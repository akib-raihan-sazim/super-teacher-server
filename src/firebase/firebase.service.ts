import { Injectable, Inject } from "@nestjs/common";

import { initializeApp, FirebaseOptions } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as path from "path";

@Injectable()
export class FirebaseService {
  private storage;

  constructor(@Inject("FIREBASE_CONFIG") private firebaseConfig: FirebaseOptions) {
    const app = initializeApp(this.firebaseConfig);
    this.storage = getStorage(app);
  }

  async uploadFile(file: Express.Multer.File, filename: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const sanitizedFilename = path.basename(filename, path.extname(filename)) + fileExtension;
    const storageRef = ref(this.storage, `uploads/${sanitizedFilename}`);
    await uploadBytes(storageRef, file.buffer);
    return getDownloadURL(storageRef);
  }
}
