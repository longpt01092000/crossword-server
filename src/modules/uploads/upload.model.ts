import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { IBaseEntity } from '@interfaces/base-entity.interface';

export type FileUploadDocument = FileUpload & Document;

export enum FileUploadType {
  VIDEO = 'video',
  LOGO = 'logo',
  FRAME = 'frame',
}

export interface IFileUpload extends IBaseEntity {
  url: string;
  originalName?: string;
  key: string;
  type: FileUploadType;
}

@Schema({ timestamps: true })
export class FileUpload {
  @Prop({ required: true })
  url: string;

  @Prop()
  originalName?: string;

  @Prop({ required: true })
  key: string;

  @Prop({ enum: FileUploadType, required: true })
  type: FileUploadType;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);
FileUploadSchema.plugin(mongoosePaginate);
