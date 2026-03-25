import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { AudioProcessor, AUDIO_QUEUE } from './audio.processor';
import { AudioStorageService } from './storage/audio-storage.service';

@Module({
  imports: [BullModule.registerQueue({ name: AUDIO_QUEUE })],
  controllers: [AudioController],
  providers: [AudioService, AudioProcessor, AudioStorageService],
})
export class AudioModule {}
