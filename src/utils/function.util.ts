import mime from 'mime-types';
import * as crypto from 'crypto';
import { promisify } from 'node:util';
import { plainToInstance } from 'class-transformer';

const pseudoRandomBytes = promisify(crypto.pseudoRandomBytes);

const getSafeExtension = (mimetype: string) => {
  if (
    mimetype === 'application/vnd.apple.mpegurl' ||
    mimetype === 'application/x-mpegURL'
  ) {
    return 'm3u8';
  }
  if (mimetype === 'video/MP2T') {
    return 'ts';
  }
  return mime.extension(mimetype) || 'bin';
};

export const generateFileKey = async (
  mimetype: string,
  folder?: string,
  originName?: string,
) => {
  const buffer = await pseudoRandomBytes(16);
  let fileKey: string = '';
  if (originName) {
    fileKey = originName;
  } else {
    fileKey =
      buffer.toString('hex') + Date.now() + '.' + getSafeExtension(mimetype);
  }

  if (folder) {
    fileKey = `${folder}/${fileKey}`;
  }

  return fileKey;
};

export const parseSort = (
  sort?: string,
): Record<string, 1 | -1> | undefined => {
  if (!sort) return undefined;

  const [field, direction] = sort.split(':');
  if (!field) return undefined;

  return {
    [field]: direction === 'desc' ? -1 : 1,
  };
};

export const PlainToInstance = <T>(
  model: new () => T,
  response: unknown,
): T => {
  return plainToInstance(model, response, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
    strategy: 'excludeAll',
  });
};

export const PlainToInstanceArray = <T>(
  model: new () => T,
  response: unknown,
): T[] => {
  return plainToInstance(model, response, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
    strategy: 'excludeAll',
  }) as T[];
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
