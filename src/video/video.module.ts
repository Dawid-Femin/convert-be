import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoProcessor, VIDEO_QUEUE } from './video.processor';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [BullModule.registerQueue({ name: VIDEO_QUEUE })],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessor, StorageService],
})
export class VideoModule {}
