import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IHashtag, Hashtag, HashtagDocument } from './hashtag.model';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { BaseService } from '../../core/base-service.core';
import { generateSlug } from '../../utils/function.util';

@Injectable()
export class HashtagService extends BaseService<HashtagDocument, IHashtag> {
  constructor(
    @InjectModel(Hashtag.name)
    hashtagModel: Model<HashtagDocument>,
  ) {
    super(hashtagModel);
  }

  async createHashtag(dto: CreateHashtagDto): Promise<IHashtag> {
    const slug = generateSlug(dto.name);

    const existingHashtag = await this.findOne({ slug });
    if (existingHashtag)
      throw new BadRequestException(`The slug "${slug}" already exists.`);

    return await super.create({ ...dto, slug });
  }

  async updateHashtag(
    id: string,
    dto: UpdateHashtagDto,
  ): Promise<IHashtag | null> {
    const hashtag = await super.findById(id);
    if (!hashtag)
      throw new NotFoundException(`Hashtag with id "${id}" was not found.`);

    let slug: string | undefined;
    if (dto.name) {
      const newSlug = generateSlug(dto.name);

      const existingHashtag = await this.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (existingHashtag)
        throw new BadRequestException(`The slug "${newSlug}" already exists.`);
    }

    return await super.update(id, { ...dto, ...(slug && { slug }) });
  }

  async findActiveHashtags(): Promise<IHashtag[] | null> {
    return await this.findAllRaw(
      { isActive: true },
      { sort: { usageCount: -1 } },
    );
  }
}
