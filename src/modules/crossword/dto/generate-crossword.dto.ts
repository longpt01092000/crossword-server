import {
  ValidateRequiredString,
  ValidateRequiredStringArray,
  ValidateRequiredNumber,
} from '../../../common/decorators/validation.decorator';

export class GenerateCrosswordDto {
  @ValidateRequiredString('Category name', 'Animals')
  category: string;

  @ValidateRequiredStringArray('Array of topics', ['Cats', 'Dogs', 'Horses'])
  topics: string[];

  @ValidateRequiredNumber('Number of crosswords per topic', 2)
  crosswordsPerTopic: number;
}
