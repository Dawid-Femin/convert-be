import { PipeTransform, BadRequestException } from '@nestjs/common';
import { VIDEO_MIME_TYPES, MAX_VIDEO_SIZE } from '../enums/video-format.enum';

export class VideoValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!VIDEO_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported: ${Object.keys(VIDEO_MIME_TYPES).join(', ')}`,
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException('File size exceeds 500MB limit');
    }

    return file;
  }
}
