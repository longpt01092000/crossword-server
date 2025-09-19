import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { IUser, User, UserDocument } from './auth.model';
import { LoginDto } from './dto/login.dto';
import { BaseService } from '../../core/base-service.core';

@Injectable()
export class AuthService extends BaseService<UserDocument, IUser> {
  constructor(
    @InjectModel(User.name)
    userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {
    super(userModel);
  }

  private async validatePassword(raw: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(raw, hash);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.validatePassword(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
