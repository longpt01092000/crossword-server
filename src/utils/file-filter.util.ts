import { extname } from 'path';
import { MulterError } from 'multer';
import type { FileFilterCallback } from 'multer';
import {
  ALLOW_MIME_TYPE,
  ALLOW_EXTENSION,
  UploadFileType,
} from '@config/constant';

export function FileFilterByType(type: UploadFileType, allowNull = false) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (!file && allowNull) return cb(null, true);

    const ext = extname(file.originalname).toLowerCase();
    const isValidMime = ALLOW_MIME_TYPE[type].includes(file.mimetype);
    const isValidExt = ALLOW_EXTENSION[type].includes(ext);

    if (!isValidMime || !isValidExt) {
      return cb(
        new MulterError(
          'LIMIT_UNEXPECTED_FILE',
          `Only ${ALLOW_EXTENSION[type].join(', ')} formats are allowed for ${type}.`,
        ),
      );
    }

    cb(null, true);
  };
}
