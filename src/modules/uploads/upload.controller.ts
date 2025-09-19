import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UploadDiskInterceptor } from '@interceptors/upload-disk.interceptor';
import { UploadS3Interceptor } from '@interceptors/upload-s3.interceptor';
import { MulterS3File } from '@interfaces/s3-file.interface';
import { PlainToInstance } from '@utils/function.util';
import { UploadService } from './upload.service';
import { FileUploadType } from './upload.model';
import { FileUploadResponseDto } from './model/upload.model';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  @Post('local/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(new UploadDiskInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const baseUrl = this.configService.get<string>('APP_DOMAIN');
    const url = `${baseUrl}/uploads/${file.filename}`;

    const data = {
      url,
      key: file.originalname,
      originalname: file.originalname,
      type: FileUploadType.LOGO,
    };

    const result = await this.uploadService.create(data);
    return PlainToInstance(FileUploadResponseDto, result);
  }

  @Post('s3/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(new UploadS3Interceptor('image'))
  async uploadImageS3(@UploadedFile() file: MulterS3File) {
    const data = {
      url: file.location,
      key: file.key,
      originalname: file.originalname,
      type: FileUploadType.LOGO,
    };

    const result = await this.uploadService.create(data);
    return PlainToInstance(FileUploadResponseDto, result);
  }

  @Post('local/video')
  @ApiOperation({ summary: 'Upload video to disk' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(new UploadDiskInterceptor('video'))
  async uploadVideoToDisk(@UploadedFile() file: Express.Multer.File) {
    const baseUrl = this.configService.get<string>('APP_DOMAIN');
    const url = `${baseUrl}/uploads/${file.filename}`;

    const data = {
      url,
      key: file.originalname,
      originalname: file.originalname,
      type: FileUploadType.VIDEO,
    };

    const result = await this.uploadService.create(data);
    return PlainToInstance(FileUploadResponseDto, result);
  }
}
