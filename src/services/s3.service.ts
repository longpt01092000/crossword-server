import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DEFAULT_S3_CONTENT_TYPE,
  S3_ACL,
  S3_CONTENT_DISPOSITION,
} from '../config/constant';
import { generateFileKey } from '../utils/function.util';

@Injectable()
export class S3Service {
  public readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('s3.region') as string;
    this.bucket = this.configService.get<string>('s3.bucketName') as string;

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId') as string,
        secretAccessKey: this.configService.get<string>(
          's3.secretAccessKey',
        ) as string,
      },
    });
  }

  private async generateFileKey(mimeType: string, folder?: string) {
    return await generateFileKey(mimeType, folder);
  }

  async deleteFileByKey(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await this.client.send(command);
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string,
  ) {
    const key = await this.generateFileKey(mimeType, folder);

    const command = new PutObjectCommand({
      ACL: S3_ACL,
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mime.contentType(mimeType) || DEFAULT_S3_CONTENT_TYPE,
      ContentDisposition: S3_CONTENT_DISPOSITION,
    });

    await this.client.send(command);

    return {
      key,
      originalName,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }
}
