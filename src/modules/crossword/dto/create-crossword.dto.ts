import { DifficultyLevel } from '../crossword.model';
import {
  ValidateOptionalBoolean,
  ValidateOptionalMongoIdArray,
  ValidateOptionalNumber,
  ValidateOptionalString,
  ValidateRequiredEnum,
  ValidateRequiredNumber,
  ValidateRequiredObjectArray,
  ValidateRequiredString,
} from '../../../common/decorators/validation.decorator';

export enum WordDirection {
  Vertical = 'V',
  Horizontal = 'H',
}

export class CrosswordWordDto {
  @ValidateRequiredString('The word for the crossword', 'HELLO')
  word: string;

  @ValidateRequiredString('The clue for the word', 'A greeting')
  clue: string;

  @ValidateRequiredString(
    'The direction of the word: VERTICAL or HORIZONTAL',
    'VERTICAL',
  )
  dir: WordDirection;

  @ValidateOptionalString('The position of the word in "x,y" format', '1,1')
  xy?: string;
}

export class CreateCrosswordDto {
  @ValidateRequiredString('Title of the crossword', 'Technology Crossword')
  title: string;

  @ValidateOptionalString(
    'Description of the crossword',
    'A crossword about technology terms',
  )
  description?: string;

  @ValidateOptionalMongoIdArray()
  hashtags?: string[];

  @ValidateOptionalBoolean('Whether the crossword is active')
  isActive?: boolean;

  @ValidateRequiredObjectArray(CrosswordWordDto, 'Array of word-clue pairs', [
    { word: 'HELLO', clue: 'A greeting', xy: '1,1', dir: 'A' },
    { word: 'WORLD', clue: 'Our planet', xy: '3,5', dir: 'D' },
  ])
  words: CrosswordWordDto[];

  @ValidateRequiredNumber('Grid size of the crossword', 15)
  size?: number;

  @ValidateRequiredEnum(
    DifficultyLevel,
    'Difficulty level of the crossword',
    DifficultyLevel.Medium,
  )
  difficulty?: DifficultyLevel;

  @ValidateOptionalNumber('CID from external system', 10092)
  cid: number;

  @ValidateOptionalNumber('Whether to show space (0 = no, 1 = yes)', 0)
  space?: 0 | 1;
}
