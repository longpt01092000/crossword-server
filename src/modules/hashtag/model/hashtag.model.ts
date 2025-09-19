import {
  ExposeBoolean,
  ExposeId,
  ExposeNumber,
  ExposeString,
} from '@common/decorators/expose.decorator';

export class HashtagResponseDto {
  @ExposeId('MongoDB ObjectId of the hashtag', '507f1f77bcf86cd799439011')
  _id: string;

  @ExposeString('Name of the hashtag', 'technology')
  name: string;

  @ExposeString('Slug of the hashtag', 'technology')
  slug: string;

  @ExposeString('Description of the hashtag', 'Technology related content')
  description?: string;

  @ExposeBoolean('Whether the hashtag is active', true)
  isActive: boolean;

  @ExposeNumber('Number of times the hashtag is used', 42)
  usageCount: number;
}
