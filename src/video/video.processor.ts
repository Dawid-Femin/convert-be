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
    const { inputPath, outputPath, targetFormat, quality, resolution } = job.data;

    try {
      await this.videoService.convert({
        inputPath,
        outputPath,
        targetFormat,
        quality,
        resolution,
        onProgress: async (percent) => {
          await job.updateProgress(percent);
        },
      });
    } catch (error) {
      // Cleanup output file on failure
      this.storageService.removeFile(outputPath);
      throw error;
    } finally {
      // Always cleanup input file
      this.storageService.removeFile(inputPath);
    }
  }
}
