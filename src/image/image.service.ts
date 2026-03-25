import { BadRequestException, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { OutputFormat } from './enums/image-format.enum';

@Injectable()
export class ImageService {
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

  async getMetadata(file: Express.Multer.File) {
    try {
      const metadata = await sharp(file.buffer).metadata();
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        size: file.size,
        density: metadata.density,
      };
    } catch {
      throw new BadRequestException('Failed to read image metadata');
    }
  }
}
