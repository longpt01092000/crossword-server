import {
  ValidateOptionalMongoId,
  ValidateOptionalString,
} from '../../../common/decorators/validation.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryCrosswordDto extends PaginationQueryDto {
  @ValidateOptionalMongoId('hashtagId must be a valid MongoDB ObjectId')
  hashtagId?: string;

  @ValidateOptionalString('Title of the crossword')
  title?: string;
}
