import { IsEnum, IsOptional, IsInt, Min, Max, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OutputFormat } from '../enums/image-format.enum';

const QUALITY_FORMATS: string[] = [OutputFormat.JPEG, OutputFormat.WEBP, OutputFormat.AVIF];

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

  @ApiPropertyOptional({
    description: 'Output quality (1-100). Only for JPEG, WebP, AVIF.',
    minimum: 1,
    maximum: 100,
    example: 80,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ValidateIf((dto) => {
    if (dto.quality !== undefined && !QUALITY_FORMATS.includes(dto.targetFormat)) {
      throw new Error(`quality is not supported for ${dto.targetFormat} format`);
    }
    return true;
  })
  quality?: number;
}
