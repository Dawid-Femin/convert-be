import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoOutputFormat } from '../enums/video-format.enum';

export class ConvertVideoDto {
  @ApiProperty({
    enum: VideoOutputFormat,
    description: 'Target video format',
    example: 'mp4',
  })
  @IsEnum(VideoOutputFormat, {
    message: `targetFormat must be one of: ${Object.values(VideoOutputFormat).join(', ')}`,
  })
  targetFormat: VideoOutputFormat;

  @ApiPropertyOptional({
    description: 'Video quality (CRF). Lower = better quality. Only for MP4/WebM.',
    minimum: 0,
    maximum: 51,
    example: 23,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(51)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Target resolution',
    example: '1280x720',
  })
  @IsOptional()
  resolution?: string;
}
