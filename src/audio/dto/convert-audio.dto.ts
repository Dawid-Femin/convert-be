import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AudioOutputFormat } from '../enums/audio-format.enum';

export class ConvertAudioDto {
  @ApiProperty({
    enum: AudioOutputFormat,
    description: 'Target audio format',
    example: 'mp3',
  })
  @IsEnum(AudioOutputFormat, {
    message: `targetFormat must be one of: ${Object.values(AudioOutputFormat).join(', ')}`,
  })
  targetFormat: AudioOutputFormat;

  @ApiPropertyOptional({
    description: 'Audio bitrate in kbps (e.g. 128, 192, 320). Applies to MP3, AAC, OGG, OPUS.',
    minimum: 32,
    maximum: 512,
    example: 192,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(32)
  @Max(512)
  bitrate?: number;
}
