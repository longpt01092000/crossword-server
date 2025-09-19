import { Types } from 'mongoose';
import { Request } from 'express';
import { UserRole } from '@modules/auth/auth.model';

export interface UserAuth {
  sub: Types.ObjectId;
  email: string;
  roles: UserRole[];
}

export interface AuthRequest extends Request {
  user?: UserAuth;
}
