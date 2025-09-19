import { DifficultyLevel } from '../crossword.model';
import { CrosswordWordDto } from './create-crossword.dto';
import {
  ValidateOptionalBoolean,
  ValidateOptionalEnum,
  ValidateOptionalMongoIdArray,
  ValidateOptionalNumber,
  ValidateOptionalObjectArray,
  ValidateOptionalString,
} from '@common/decorators/validation.decorator';

export class UpdateCrosswordDto {
  @ValidateOptionalString('Title of the crossword', 'Technology Crossword')
  title?: string;

  @ValidateOptionalString(
    'Description of the crossword',
    'A crossword about technology terms',
  )
  description?: string;

  @ValidateOptionalMongoIdArray()
  hashtags?: string[];

  @ValidateOptionalBoolean('Whether the crossword is active')
  isActive?: boolean;

  @ValidateOptionalObjectArray(CrosswordWordDto, 'Array of word-clue pairs', [
    { word: 'HELLO', clue: 'A greeting', xy: '1,1', dir: 'A' },
    { word: 'WORLD', clue: 'Our planet', xy: '3,5', dir: 'D' },
  ])
  words?: CrosswordWordDto[];

  @ValidateOptionalNumber('Grid size of the crossword', 15)
  size?: number;

  @ValidateOptionalEnum(
    DifficultyLevel,
    'Difficulty level of the crossword',
    DifficultyLevel.Medium,
  )
  difficulty?: DifficultyLevel;

  @ValidateOptionalNumber('CID from external system', 10092)
  cid?: number;

  @ValidateOptionalNumber('Whether to show space (0 = no, 1 = yes)', 0)
  space?: 0 | 1;
}
