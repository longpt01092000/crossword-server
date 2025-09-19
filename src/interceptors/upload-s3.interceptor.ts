import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import * as crypto from 'crypto';

import { FileFilterByType } from '../utils/file-filter.util';
import {
  FILE_SIZE_LIMIT,
  MAX_FILE_SIZE,
  S3_ACL,
  UploadFileType,
} from '../config/constant';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UploadS3Interceptor implements NestInterceptor {
  private upload;

  constructor(private readonly type: UploadFileType) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
    const bucket = process.env.AWS_BUCKET_NAME as string;

    this.upload = multer({
      storage: multerS3({
        s3: s3,
        bucket,
        acl: S3_ACL,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (_req, _file, cb) => cb(null, {}),
        key: (req: Request, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const folder = req.body.folder || 'default';

          crypto.randomBytes(16, (err, raw) => {
            if (err) return cb(err, '');
            const filename = `${folder}/${raw.toString('hex')}-${Date.now()}${ext}`;
            cb(null, filename);
          });
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
