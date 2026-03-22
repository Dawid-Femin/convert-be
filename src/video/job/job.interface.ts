export interface VideoJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputPath: string;
  outputPath: string;
  targetFormat: string;
  originalName: string;
  error?: string;
}
