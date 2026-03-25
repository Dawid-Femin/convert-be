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
import { ApiOperation, ApiConsumes, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { VideoValidationPipe } from './pipes/video-validation.pipe';
import { ConvertVideoDto } from './dto/convert-video.dto';
import { ExtractAudioDto, AudioExtractFormat } from './dto/extract-audio.dto';
import { VideoInputFormat, VideoOutputFormat, VIDEO_MIME_TYPES } from './enums/video-format.enum';
import { StorageService } from './storage/storage.service';
import { VideoService } from './video.service';
import { VIDEO_QUEUE } from './video.processor';

@Controller('video')
export class VideoController {
  constructor(
    @InjectQueue(VIDEO_QUEUE) private readonly videoQueue: Queue,
    private readonly storageService: StorageService,
    private readonly videoService: VideoService,
  ) {}

  @Get('formats')
  @ApiOperation({ summary: 'Get supported video formats' })
  getFormats() {
    return {
      input: Object.values(VideoInputFormat),
      output: Object.values(VideoOutputFormat),
    };
  }

  @Post('convert')
  @HttpCode(202)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'tmp', 'video'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}-input${path.extname(file.originalname)}`),
      }),
    }),
  )
  @ApiOperation({ summary: 'Submit video conversion job' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'targetFormat'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Video file (max 500MB)' },
        targetFormat: { type: 'string', enum: Object.values(VideoOutputFormat) },
        quality: { type: 'integer', minimum: 0, maximum: 51, description: 'CRF quality (0-51, lower=better)' },
        resolution: { type: 'string', description: 'Target resolution (e.g. 1280x720)' },
        startTime: { type: 'string', description: 'Trim start (e.g. 00:00:10)' },
        endTime: { type: 'string', description: 'Trim end (e.g. 00:01:30)' },
      },
    },
  })
  async convert(
    @UploadedFile(new VideoValidationPipe()) file: Express.Multer.File,
    @Body() dto: ConvertVideoDto,
  ) {
    const outputPath = this.storageService.getOutputPath(randomUUID(), dto.targetFormat);

    const job = await this.videoQueue.add('convert', {
      inputPath: file.path,
      outputPath,
      targetFormat: dto.targetFormat,
      quality: dto.quality,
      resolution: dto.resolution,
      startTime: dto.startTime,
      endTime: dto.endTime,
      originalName: file.originalname,
    });

    return { jobId: job.id, status: 'pending' };
  }

  @Post('metadata')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'tmp', 'video'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}-meta${path.extname(file.originalname)}`),
      }),
    }),
  )
  @ApiOperation({ summary: 'Get video metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Video file (max 500MB)' },
      },
    },
  })
  async getMetadata(
    @UploadedFile(new VideoValidationPipe()) file: Express.Multer.File,
  ) {
    try {
      const data = await this.videoService.getMetadata(file.path);
      const video = data.streams.find((s) => s.codec_type === 'video');
      const audio = data.streams.find((s) => s.codec_type === 'audio');

      return {
        format: data.format.format_name,
        duration: data.format.duration,
        size: data.format.size,
        bitrate: data.format.bit_rate,
        video: video
          ? { codec: video.codec_name, width: video.width, height: video.height, fps: video.r_frame_rate }
          : null,
        audio: audio
          ? { codec: audio.codec_name, sampleRate: audio.sample_rate, channels: audio.channels }
          : null,
      };
    } finally {
      this.storageService.removeFile(file.path);
    }
  }

  @Post('extract-audio')
  @HttpCode(202)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'tmp', 'video'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}-input${path.extname(file.originalname)}`),
      }),
    }),
  )
  @ApiOperation({ summary: 'Extract audio track from video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'format'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Video file (max 500MB)' },
        format: { type: 'string', enum: Object.values(AudioExtractFormat) },
        bitrate: { type: 'integer', minimum: 32, maximum: 512, description: 'Audio bitrate in kbps' },
      },
    },
  })
  async extractAudio(
    @UploadedFile(new VideoValidationPipe()) file: Express.Multer.File,
    @Body() dto: ExtractAudioDto,
  ) {
    const outputPath = this.storageService.getOutputPath(randomUUID(), dto.format);

    const job = await this.videoQueue.add('extract-audio', {
      inputPath: file.path,
      outputPath,
      format: dto.format,
      bitrate: dto.bitrate,
      targetFormat: dto.format,
      originalName: file.originalname,
    });

    return { jobId: job.id, status: 'pending' };
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get video conversion job status' })
  async getJobStatus(@Param('id') id: string) {
    const job = await this.videoQueue.getJob(id);
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
  @ApiOperation({ summary: 'Download converted video' })
  @ApiOkResponse({ description: 'Converted video file' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const job = await this.videoQueue.getJob(id);
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
    const audioMimes: Record<string, string> = {
      mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
      aac: 'audio/aac', ogg: 'audio/ogg',
    };
    const contentType = audioMimes[targetFormat]
      ?? (targetFormat === 'gif' ? 'image/gif' : `video/${targetFormat}`);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${baseName}.${targetFormat}"`,
    });

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
  }
}
