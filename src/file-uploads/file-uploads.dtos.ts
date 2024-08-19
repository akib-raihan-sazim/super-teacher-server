import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from "class-validator";

import { ALLOWED_MIME_TYPES } from "./file-uploads.constants";

export class PresignedUrlFile {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MIME_TYPES)
  type!: string;
}

export class PresignedUrlFileDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PresignedUrlFile)
  files!: PresignedUrlFile[];
}

export class PresignedUrlResponse extends PresignedUrlFile {
  signedUrl!: string;
}
