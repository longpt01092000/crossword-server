export const S3_ACL = 'public-read';

export type UploadFileType = 'image' | 'video' | 'others' | 'audio';

export const FILE_SIZE_LIMIT: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  audio: 50 * 1024 * 1024, // 75 MB
  video: 5 * 1024 * 1024 * 1024, // 50 MB
  others: 30 * 1024 * 1024, // 30 MB
};

export const MAX_FILE_SIZE = Object.values(FILE_SIZE_LIMIT).reduce(
  (prev, curr) => (prev < curr ? curr : prev),
  Number.MIN_VALUE,
);

export const ALLOW_MIME_TYPE: Record<string, string[]> = {
  image: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
  video: ['video/mp4'],
  audio: [
    'audio/mpeg',
    'audio/mp4',
    'audio/m4a',
    'audio/wave',
    'audio/wav',
    'audio/x-wav',
  ],
  others: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const ALLOW_EXTENSION: Record<UploadFileType, string[]> = {
  image: ['.png', '.jpg', '.jpeg', '.webp'],
  video: ['.mp4'],
  audio: ['.mp3', '.mpga', '.m4a', '.wav'],
  others: ['.pdf', '.txt', '.xlsx'],
};

export const DEFAULT_S3_CONTENT_TYPE = 'application/octet-stream';

export const S3_CONTENT_DISPOSITION = 'inline';
