import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { VideoOutputFormat } from './enums/video-format.enum';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  targetFormat: VideoOutputFormat;
  quality?: number;
  resolution?: string;
  startTime?: string;
  endTime?: string;
  onProgress?: (percent: number) => void;
}

export interface ExtractAudioOptions {
  inputPath: string;
  outputPath: string;
  format: string;
  bitrate?: number;
  onProgress?: (percent: number) => void;
}

@Injectable()
export class VideoService {
  convert(options: ConvertOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath);

      if (options.startTime) {
        command = command.setStartTime(options.startTime);
      }
      if (options.endTime) {
        command = command.outputOptions(['-to', options.endTime]);
      }

      if (options.targetFormat === VideoOutputFormat.GIF) {
        command = command.outputOptions(['-vf', 'fps=10,scale=480:-1:flags=lanczos']);
      } else {
        const codecMap: Partial<Record<VideoOutputFormat, string>> = {
          [VideoOutputFormat.WEBM]: 'libvpx-vp9',
          [VideoOutputFormat.MKV]: 'libx264',
          [VideoOutputFormat.FLV]: 'libx264',
          [VideoOutputFormat.TS]: 'libx264',
        };
        command = command.videoCodec(codecMap[options.targetFormat] || 'libx264');

        if (options.quality !== undefined) {
          command = command.outputOptions([`-crf`, `${options.quality}`]);
        }
      }

      if (options.resolution) {
        command = command.size(options.resolution);
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

  extractAudio(options: ExtractAudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath).noVideo();

      const codecMap: Record<string, string> = {
        mp3: 'libmp3lame',
        aac: 'aac',
        ogg: 'libvorbis',
        flac: 'flac',
        wav: 'pcm_s16le',
      };

      command = command.audioCodec(codecMap[options.format] || 'copy');

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
