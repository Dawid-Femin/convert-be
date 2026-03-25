export enum AudioInputFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  AAC = 'aac',
  OGG = 'ogg',
  WMA = 'wma',
  M4A = 'm4a',
  OPUS = 'opus',
  AIFF = 'aiff',
}

export enum AudioOutputFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  AAC = 'aac',
  OGG = 'ogg',
  M4A = 'm4a',
  OPUS = 'opus',
}

export const AUDIO_MIME_TYPES: Record<string, AudioInputFormat> = {
  'audio/mpeg': AudioInputFormat.MP3,
  'audio/wav': AudioInputFormat.WAV,
  'audio/x-wav': AudioInputFormat.WAV,
  'audio/flac': AudioInputFormat.FLAC,
  'audio/aac': AudioInputFormat.AAC,
  'audio/ogg': AudioInputFormat.OGG,
  'audio/x-ms-wma': AudioInputFormat.WMA,
  'audio/mp4': AudioInputFormat.M4A,
  'audio/x-m4a': AudioInputFormat.M4A,
  'audio/opus': AudioInputFormat.OPUS,
  'audio/aiff': AudioInputFormat.AIFF,
  'audio/x-aiff': AudioInputFormat.AIFF,
};

export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
