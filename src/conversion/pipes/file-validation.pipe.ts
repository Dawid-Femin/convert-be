import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { INPUT_MIME_TYPES } from '../enums/image-format.enum';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!INPUT_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported: ${Object.keys(INPUT_MIME_TYPES).join(', ')}`,
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 20MB limit');
    }

    return file;
  }
}
