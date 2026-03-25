import { PipeTransform, BadRequestException } from '@nestjs/common';
import { AUDIO_MIME_TYPES, MAX_AUDIO_SIZE } from '../enums/audio-format.enum';

export class AudioValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!AUDIO_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported: ${Object.keys(AUDIO_MIME_TYPES).join(', ')}`,
      );
    }

    if (file.size > MAX_AUDIO_SIZE) {
      throw new BadRequestException('File size exceeds 100MB limit');
    }

    return file;
  }
}
