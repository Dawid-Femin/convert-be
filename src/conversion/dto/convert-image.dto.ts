import { IsEnum } from 'class-validator';
import { OutputFormat } from '../enums/image-format.enum';

export class ConvertImageDto {
  @IsEnum(OutputFormat, {
    message: `targetFormat must be one of: ${Object.values(OutputFormat).join(', ')}`,
  })
  targetFormat: OutputFormat;
}
