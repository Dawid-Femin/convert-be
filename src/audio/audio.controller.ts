import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { AudioValidationPipe } from './pipes/audio-validation.pipe';
import { ConvertAudioDto } from './dto/convert-audio.dto';
import { AudioInputFormat, AudioOutputFormat, AUDIO_MIME_TYPES } from './enums/audio-format.enum';
import { AudioStorageService } from './storage/audio-storage.service';
import { AudioService } from './audio.service';
import { AUDIO_QUEUE } from './audio.processor';

@ApiTags('Audio Conversion')
@Controller('audio')
export class AudioController {
  constructor(
    @InjectQueue(AUDIO_QUEUE) private readonly audioQueue: Queue,
    private readonly storageService: AudioStorageService,
    private readonly audioService: AudioService,
  ) {}

  @Get('formats')
  @ApiOperation({ summary: 'Get supported audio formats' })
  getFormats() {
    return {
      input: Object.values(AudioInputFormat),
      output: Object.values(AudioOutputFormat),
    };
  }

  @Post('convert')
  @HttpCode(202)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'tmp', 'audio'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}-input${path.extname(file.originalname)}`),
      }),
    }),
  )
  @ApiOperation({ summary: 'Submit audio conversion job' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'targetFormat'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Audio file (max 100MB)' },
        targetFormat: { type: 'string', enum: Object.values(AudioOutputFormat) },
        bitrate: { type: 'integer', minimum: 32, maximum: 512, description: 'Bitrate in kbps' },
      },
    },
  })
  async convert(
    @UploadedFile(new AudioValidationPipe()) file: Express.Multer.File,
    @Body() dto: ConvertAudioDto,
  ) {
    const outputPath = this.storageService.getOutputPath(randomUUID(), dto.targetFormat);

    const job = await this.audioQueue.add('convert', {
      inputPath: file.path,
      outputPath,
      targetFormat: dto.targetFormat,
      bitrate: dto.bitrate,
      originalName: file.originalname,
    });

    return { jobId: job.id, status: 'pending' };
  }

  @Post('metadata')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'tmp', 'audio'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}-meta${path.extname(file.originalname)}`),
      }),
    }),
  )
  @ApiOperation({ summary: 'Get audio metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Audio file (max 100MB)' },
      },
    },
  })
  async getMetadata(
    @UploadedFile(new AudioValidationPipe()) file: Express.Multer.File,
  ) {
    try {
      const data = await this.audioService.getMetadata(file.path);
      const audio = data.streams.find((s) => s.codec_type === 'audio');

      return {
        format: data.format.format_name,
        duration: data.format.duration,
        size: data.format.size,
        bitrate: data.format.bit_rate,
        audio: audio
          ? { codec: audio.codec_name, sampleRate: audio.sample_rate, channels: audio.channels }
          : null,
      };
    } finally {
      this.storageService.removeFile(file.path);
    }
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get audio conversion job status' })
  async getJobStatus(@Param('id') id: string) {
    const job = await this.audioQueue.getJob(id);
    if (!job) throw new NotFoundException('Job not found');

    const state = await job.getState();
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    return {
      jobId: job.id,
      status: state === 'waiting' || state === 'delayed' ? 'pending' : state,
      progress,
      ...(state === 'failed' && { error: job.failedReason }),
    };
  }

  @Get('jobs/:id/download')
  @ApiOperation({ summary: 'Download converted audio' })
  @ApiOkResponse({ description: 'Converted audio file' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const job = await this.audioQueue.getJob(id);
    if (!job) throw new NotFoundException('Job not found');

    const state = await job.getState();
    if (state !== 'completed') {
      throw new BadRequestException(`Job is not completed yet (status: ${state})`);
    }

    const { outputPath, targetFormat, originalName } = job.data;

    if (!fs.existsSync(outputPath)) {
      throw new NotFoundException('Output file expired or not found');
    }

    const baseName = path.parse(originalName).name;
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      opus: 'audio/opus',
    };

    res.set({
      'Content-Type': mimeMap[targetFormat] ?? 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${baseName}.${targetFormat}"`,
    });

    fs.createReadStream(outputPath).pipe(res);
  }
}
