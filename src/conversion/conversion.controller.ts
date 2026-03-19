import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConversionService } from './conversion.service';
import { ConvertImageDto } from './dto/convert-image.dto';
import { InputFormat, OutputFormat } from './enums/image-format.enum';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@ApiTags('Image Conversion')
@Controller()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('formats')
  @ApiOperation({ summary: 'Get supported image formats' })
  getFormats() {
    return {
      input: Object.values(InputFormat),
      output: Object.values(OutputFormat),
    };
  }

  @Post('convert')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Convert an image to a different format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'targetFormat'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (max 20MB)' },
        targetFormat: { type: 'string', enum: Object.values(OutputFormat), description: 'Target format' },
      },
    },
  })
  @ApiOkResponse({ description: 'Converted image file', content: { 'image/*': {} } })
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
