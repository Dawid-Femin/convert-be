import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AudioService } from './audio.service';
import { AudioStorageService } from './storage/audio-storage.service';

export const AUDIO_QUEUE = 'audio-conversion';

@Processor(AUDIO_QUEUE, { concurrency: 3 })
export class AudioProcessor extends WorkerHost {
  constructor(
    private readonly audioService: AudioService,
    private readonly storageService: AudioStorageService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { inputPath, outputPath, targetFormat, bitrate } = job.data;

    try {
      await this.audioService.convert({
        inputPath,
        outputPath,
        targetFormat,
        bitrate,
        onProgress: async (percent) => {
          await job.updateProgress(percent);
        },
      });
    } catch (error) {
      this.storageService.removeFile(outputPath);
      throw error;
    } finally {
      this.storageService.removeFile(inputPath);
    }
  }
}
