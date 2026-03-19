import { BadRequestException, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { OutputFormat } from './enums/image-format.enum';

@Injectable()
export class ConversionService {
  async convert(
    file: Express.Multer.File,
    targetFormat: OutputFormat,
    quality?: number,
  ): Promise<Buffer> {
    try {
      return await sharp(file.buffer)
        .toFormat(targetFormat, quality ? { quality } : undefined)
        .toBuffer();
    } catch {
      throw new BadRequestException('Failed to convert image');
    }
  }
}
