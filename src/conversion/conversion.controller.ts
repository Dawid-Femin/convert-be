import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConversionService } from './conversion.service';
import { ConvertImageDto } from './dto/convert-image.dto';
import { InputFormat, OutputFormat } from './enums/image-format.enum';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@Controller()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('formats')
  getFormats() {
    return {
      input: Object.values(InputFormat),
      output: Object.values(OutputFormat),
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async convert(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body() dto: ConvertImageDto,
    @Res() res: Response,
  ) {
    const buffer = await this.conversionService.convert(file, dto.targetFormat);

    res.set({
      'Content-Type': `image/${dto.targetFormat}`,
      'Content-Disposition': `attachment; filename="converted.${dto.targetFormat}"`,
    });

    res.send(buffer);
  }
}
