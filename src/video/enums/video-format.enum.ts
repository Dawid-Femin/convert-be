export enum VideoInputFormat {
  MP4 = 'mp4',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
  WEBM = 'webm',
  FLV = 'flv',
}

export enum VideoOutputFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  GIF = 'gif',
}

export const VIDEO_MIME_TYPES: Record<string, VideoInputFormat> = {
  'video/mp4': VideoInputFormat.MP4,
  'video/x-msvideo': VideoInputFormat.AVI,
  'video/quicktime': VideoInputFormat.MOV,
  'video/x-matroska': VideoInputFormat.MKV,
  'video/webm': VideoInputFormat.WEBM,
  'video/x-flv': VideoInputFormat.FLV,
};

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
