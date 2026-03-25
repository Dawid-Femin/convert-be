import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { AudioOutputFormat } from './enums/audio-format.enum';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface AudioConvertOptions {
  inputPath: string;
  outputPath: string;
  targetFormat: AudioOutputFormat;
  bitrate?: number;
  onProgress?: (percent: number) => void;
}

@Injectable()
export class AudioService {
  convert(options: AudioConvertOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath).noVideo();

      const codecMap: Partial<Record<AudioOutputFormat, string>> = {
        [AudioOutputFormat.MP3]: 'libmp3lame',
        [AudioOutputFormat.AAC]: 'aac',
        [AudioOutputFormat.OGG]: 'libvorbis',
        [AudioOutputFormat.OPUS]: 'libopus',
        [AudioOutputFormat.FLAC]: 'flac',
        [AudioOutputFormat.WAV]: 'pcm_s16le',
        [AudioOutputFormat.M4A]: 'aac',
      };

      command = command.audioCodec(codecMap[options.targetFormat] || 'copy');

      if (options.bitrate) {
        command = command.audioBitrate(`${options.bitrate}k`);
      }

      command
        .output(options.outputPath)
        .on('progress', (progress) => {
          options.onProgress?.(Math.round(progress.percent || 0));
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  getMetadata(filePath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}
