import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'tmp', 'video');

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private cleanupInterval: NodeJS.Timeout;
  private readonly ttl = 30 * 60 * 1000; // 30 minutes

  onModuleInit() {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  getStorageDir() {
    return STORAGE_DIR;
  }

  getOutputPath(jobId: string, format: string) {
    return path.join(STORAGE_DIR, `${jobId}-output.${format}`);
  }

  removeFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
  }

  private cleanup() {
    try {
      const files = fs.readdirSync(STORAGE_DIR);
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(STORAGE_DIR, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > this.ttl) {
          fs.unlinkSync(filePath);
        }
      }
    } catch {}
  }
}
