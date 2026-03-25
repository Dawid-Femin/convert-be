import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VideoService } from './video.service';
import { StorageService } from './storage/storage.service';

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
    const { inputPath, outputPath } = job.data;

    try {
      if (job.name === 'extract-audio') {
        await this.videoService.extractAudio({
          inputPath,
          outputPath,
          format: job.data.format,
          bitrate: job.data.bitrate,
          onProgress: async (percent) => {
            await job.updateProgress(percent);
          },
        });
      } else {
        await this.videoService.convert({
          inputPath,
          outputPath,
          targetFormat: job.data.targetFormat,
          quality: job.data.quality,
          resolution: job.data.resolution,
          startTime: job.data.startTime,
          endTime: job.data.endTime,
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
