import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as multer from 'multer';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { FileFilterByType } from '../utils/file-filter.util';
import {
  FILE_SIZE_LIMIT,
  MAX_FILE_SIZE,
  UploadFileType,
} from '../config/constant';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const generateFileName = (originalName: string): string => {
  const buffer = crypto.randomBytes(16);
  const ext = path.extname(originalName).toLowerCase();
  return `${buffer.toString('hex')}-${Date.now()}${ext}`;
};

@Injectable()
export class UploadDiskInterceptor implements NestInterceptor {
  private upload;

  constructor(private readonly type: UploadFileType) {
    this.upload = multer({
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadFolder),
        filename: (_req, file, cb) => {
          try {
            const filename = generateFileName(file.originalname);
            cb(null, filename);
          } catch (err) {
            cb(err, '');
          }
        },
      }),
      fileFilter: FileFilterByType(this.type),
      limits: {
        fileSize: FILE_SIZE_LIMIT[this.type] || MAX_FILE_SIZE,
      },
    }).single('file');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return new Observable((observer) => {
      this.upload(request, request.res, (err: Error | null) => {
        if (err) {
          observer.error(new BadRequestException(err.message));
        } else {
          next.handle().subscribe({
            next: (value) => {
              observer.next(value);
              observer.complete();
            },
            error: (error) => observer.error(error),
          });
        }
      });
    });
  }
}
