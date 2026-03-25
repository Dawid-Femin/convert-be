import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CompressImageDto {
  @ApiPropertyOptional({
    description: 'Output quality (1-100). For JPEG, WebP, AVIF.',
    minimum: 1,
    maximum: 100,
    example: 75,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Reduce PNG to 8-bit palette mode for smaller file size.',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  palette?: boolean;
}
