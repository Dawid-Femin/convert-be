export enum InputFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  GIF = 'gif',
  TIFF = 'tiff',
  BMP = 'bmp',
}

export enum OutputFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
}

export const INPUT_MIME_TYPES: Record<string, InputFormat> = {
  'image/jpeg': InputFormat.JPEG,
  'image/png': InputFormat.PNG,
  'image/webp': InputFormat.WEBP,
  'image/gif': InputFormat.GIF,
  'image/tiff': InputFormat.TIFF,
  'image/bmp': InputFormat.BMP,
};
