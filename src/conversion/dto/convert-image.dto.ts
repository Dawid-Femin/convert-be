import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OutputFormat } from '../enums/image-format.enum';

export class ConvertImageDto {
  @ApiProperty({
    enum: OutputFormat,
    description: 'Target image format',
    example: 'webp',
  })
  @IsEnum(OutputFormat, {
    message: `targetFormat must be one of: ${Object.values(OutputFormat).join(', ')}`,
  })
  targetFormat: OutputFormat;
}
