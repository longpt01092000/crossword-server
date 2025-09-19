import { Types } from 'mongoose';

export interface IBaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
