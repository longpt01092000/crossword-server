import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { FileUpload, FileUploadDocument, IFileUpload } from './upload.model';
import { BaseService } from '../../core/base-service.core';

@Injectable()
export class UploadService extends BaseService<
  FileUploadDocument,
  IFileUpload
> {
  constructor(
    @InjectModel(FileUpload.name)
    model: Model<FileUploadDocument>,
  ) {
    super(model);
  }
}
