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

  async compress(
    file: Express.Multer.File,
    quality?: number,
    palette?: boolean,
  ): Promise<{ buffer: Buffer; format: string }> {
    try {
      const metadata = await sharp(file.buffer).metadata();
      const format = metadata.format;
      let pipeline = sharp(file.buffer);

      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: quality ?? 75, mozjpeg: true });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality: quality ?? 75 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality: quality ?? 50 });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: 9,
            ...(palette ? { palette: true, colours: 256 } : {}),
          });
          break;
        case 'tiff':
          pipeline = pipeline.tiff({ compression: 'lzw', quality: quality ?? 75 });
          break;
        default:
          throw new BadRequestException(`Compression not supported for ${format}`);
      }

      const buffer = await pipeline.toBuffer();
      return { buffer, format: format! };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to compress image');
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
