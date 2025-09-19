import { IBaseEntity } from '../../interfaces/base-entity.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2');

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser extends IBaseEntity {
  email: string;
  password: string;
  roles: UserRole[];
}

@Schema({ timestamps: true })
export class User implements IUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: UserRole,
    default: [UserRole.USER],
  })
  roles: UserRole[];

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);
