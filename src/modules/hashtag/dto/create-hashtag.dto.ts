import {
  ValidateOptionalBoolean,
  ValidateOptionalString,
  ValidateRequiredString,
} from '../../../common/decorators/validation.decorator';

export class CreateHashtagDto {
  @ValidateRequiredString(
    'Name of the hashtag (without # symbol)',
    'technology',
  )
  name: string;

  @ValidateOptionalString(
    'Description of the hashtag',
    'Technology related content',
  )
  description?: string;

  @ValidateOptionalBoolean('Whether the hashtag is active', true)
  isActive?: boolean;
}
