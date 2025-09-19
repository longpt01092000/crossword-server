import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2');
import { IBaseEntity } from '../../interfaces/base-entity.interface';

export type CrosswordDocument = Crossword & Document;

export enum DifficultyLevel {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Harder = 'harder',
}

export enum CreatedByType {
  Community = 'community',
  Admin = 'admin',
}

export interface IWordClue {
  word: string;
  clue: string;
  xy?: string;
  dir?: string;
}

export interface ICrossword extends IBaseEntity {
  title: string;
  description?: string;
  hashtags: Types.ObjectId[];
  isActive: boolean;
  size: number;
  difficulty: DifficultyLevel;
  cid: number;
  words: IWordClue[];
  author?: Types.ObjectId;
  space?: 0 | 1;
  createdBy?: CreatedByType;
  isSyncGenPuzzles: boolean;
}

export class WordClue {
  @Prop({ required: true, trim: true })
  word: string;

  @Prop({ required: true, trim: true })
  clue: string;

  @Prop({ trim: true })
  xy: string;

  @Prop({ trim: true })
  dir: string;
}

@Schema({ timestamps: true })
export class Crossword implements ICrossword {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Hashtag' }], default: [] })
  hashtags: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [WordClue], required: true, default: [], _id: false })
  words: IWordClue[];

  @Prop({ default: 0 })
  size: number;

  @Prop({ enum: DifficultyLevel, default: DifficultyLevel.Easy })
  difficulty: DifficultyLevel;

  @Prop({ default: 0 })
  cid: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author?: Types.ObjectId;

  @Prop({ type: Number, enum: [0, 1], default: 0 })
  space?: 0 | 1;

  @Prop({
    enum: CreatedByType,
    required: true,
    default: CreatedByType.Community,
  })
  createdBy: CreatedByType;

  @Prop({ default: false })
  isSyncGenPuzzles: boolean;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const WordClueSchema = SchemaFactory.createForClass(WordClue);
export const CrosswordSchema = SchemaFactory.createForClass(Crossword);
CrosswordSchema.plugin(mongoosePaginate);
