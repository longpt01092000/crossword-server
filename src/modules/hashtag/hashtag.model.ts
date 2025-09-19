import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { IBaseEntity } from '../../interfaces/base-entity.interface';
import { CreatedByType } from '../../modules/crossword/crossword.model';

export type HashtagDocument = Hashtag & Document;

export interface IHashtag extends IBaseEntity {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  usageCount: number;
  createdBy?: CreatedByType;
}

@Schema({ timestamps: true })
export class Hashtag implements IHashtag {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({
    enum: CreatedByType,
    required: true,
    default: CreatedByType.Community,
  })
  createdBy: CreatedByType;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const HashtagSchema = SchemaFactory.createForClass(Hashtag);
HashtagSchema.plugin(mongoosePaginate);
