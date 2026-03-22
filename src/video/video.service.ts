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
  onProgress?: (percent: number) => void;
}

@Injectable()
export class VideoService {
  convert(options: ConvertOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath);

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

  getMetadata(filePath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}
