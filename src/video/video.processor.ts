import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VideoService } from './video.service';
import { StorageService } from './storage/storage.service';
import { AUDIO_OUTPUT_FORMATS } from './enums/video-format.enum';

export const VIDEO_QUEUE = 'video-conversion';

@Processor(VIDEO_QUEUE, { concurrency: 2 })
export class VideoProcessor extends WorkerHost {
  constructor(
    private readonly videoService: VideoService,
    private readonly storageService: StorageService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { inputPath, outputPath, targetFormat, quality, resolution, startTime, endTime, bitrate } = job.data;
    const isAudio = AUDIO_OUTPUT_FORMATS.map(f => f.toString()).includes(targetFormat);

    try {
      if (isAudio) {
        await this.videoService.extractAudio({
          inputPath,
          outputPath,
          format: targetFormat,
          bitrate,
          onProgress: async (percent) => {
            await job.updateProgress(percent);
          },
        });
      } else {
        await this.videoService.convert({
          inputPath,
          outputPath,
          targetFormat,
          quality,
          resolution,
          startTime,
          endTime,
          onProgress: async (percent) => {
            await job.updateProgress(percent);
          },
        });
      }
    } catch (error) {
      this.storageService.removeFile(outputPath);
      throw error;
    } finally {
      this.storageService.removeFile(inputPath);
    }
  }
}
