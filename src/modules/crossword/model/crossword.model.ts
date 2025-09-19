import { DifficultyLevel } from '../crossword.model';
import { HashtagResponseDto } from '../../hashtag/model/hashtag.model';
import {
  ExposeBoolean,
  ExposeDate,
  ExposeEnum,
  ExposeId,
  ExposeNumber,
  ExposeObjectArray,
  ExposeString,
} from '../../../common/decorators/expose.decorator';

export class WordResponseDto {
  @ExposeString('The actual word in the crossword', 'HELLO')
  word: string;

  @ExposeString('The clue for the word', 'A greeting')
  clue: string;

  @ExposeString('The position of the word in "x,y" format', '3,5')
  xy: string;

  @ExposeString('The direction of the word: A (across) or D (down)', 'A')
  dir: string;
}

export class CrosswordResponseDto {
  @ExposeId('MongoDB ObjectId of the crossword', '507f1f77bcf86cd799439011')
  _id: string;

  @ExposeString('Title of the crossword', 'Technology Crossword')
  title: string;

  @ExposeString(
    'Description of the crossword',
    'A crossword about technology terms',
  )
  description?: string;

  @ExposeBoolean('Whether the crossword is active', true)
  isActive: boolean;

  @ExposeNumber('Grid size of the crossword (e.g. 15)', 15)
  size: number;

  @ExposeEnum(
    DifficultyLevel,
    'Difficulty level of the crossword',
    DifficultyLevel.Medium,
  )
  difficulty: DifficultyLevel;

  @ExposeNumber('Crossword CID from external system', 10092)
  cid: number;

  @ExposeId('User ID of the author', '507f191e810c19729de860ec')
  author?: string;

  @ExposeString('Created by', 'admin')
  createdBy: string;

  @ExposeNumber('Whether to show space (0 = no, 1 = yes)', 0)
  space?: 0 | 1;

  @ExposeDate('Date when the crossword was created', '2025-01-15T10:30:00.000Z')
  createdAt: Date;

  @ExposeDate(
    'Date when the crossword was last updated',
    '2025-01-15T10:30:00.000Z',
  )
  updatedAt: Date;
}

export class CrosswordDetailResponseDto extends CrosswordResponseDto {
  @ExposeObjectArray(WordResponseDto, 'Array of word-clue pairs', [
    {
      word: 'HELLO',
      clue: 'A greeting',
      xy: '1,1',
      dir: 'A',
    },
    {
      word: 'WORLD',
      clue: 'Our planet',
      xy: '3,5',
      dir: 'D',
    },
  ])
  words: WordResponseDto[];

  @ExposeObjectArray(HashtagResponseDto, 'List of associated hashtags', [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'technology',
      slug: 'technology',
      description: 'Technology related content',
      isActive: true,
      usageCount: 42,
    },
  ])
  hashtags: HashtagResponseDto[];
}
