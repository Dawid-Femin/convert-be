import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum AudioExtractFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  AAC = 'aac',
  OGG = 'ogg',
}

export class ExtractAudioDto {
  @ApiProperty({
    enum: AudioExtractFormat,
    description: 'Output audio format',
    example: 'mp3',
  })
  @IsEnum(AudioExtractFormat)
  format: AudioExtractFormat;

  @ApiPropertyOptional({
    description: 'Audio bitrate in kbps',
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
