import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConversionModule } from './conversion/conversion.module';
import { VideoModule } from './video/video.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } }),
    ConversionModule,
    VideoModule,
    AudioModule,
  ],
})
export class AppModule {}
