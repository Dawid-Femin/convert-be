export enum VideoInputFormat {
  MP4 = 'mp4',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
  WEBM = 'webm',
  FLV = 'flv',
  WMV = 'wmv',
  THREEGP = '3gp',
  M4V = 'm4v',
  TS = 'ts',
  OGG = 'ogg',
  VOB = 'vob',
}

export enum VideoOutputFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
  FLV = 'flv',
  TS = 'ts',
  GIF = 'gif',
}

export const VIDEO_MIME_TYPES: Record<string, VideoInputFormat> = {
  'video/mp4': VideoInputFormat.MP4,
  'video/x-msvideo': VideoInputFormat.AVI,
  'video/quicktime': VideoInputFormat.MOV,
  'video/x-matroska': VideoInputFormat.MKV,
  'video/webm': VideoInputFormat.WEBM,
  'video/x-flv': VideoInputFormat.FLV,
  'video/x-ms-wmv': VideoInputFormat.WMV,
  'video/3gpp': VideoInputFormat.THREEGP,
  'video/x-m4v': VideoInputFormat.M4V,
  'video/mp2t': VideoInputFormat.TS,
  'video/ogg': VideoInputFormat.OGG,
  'video/x-ms-vob': VideoInputFormat.VOB,
};

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
