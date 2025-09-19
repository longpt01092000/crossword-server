import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CrosswordController } from './crossword.controller';
import { CrosswordService } from './crossword.service';
import { Crossword, CrosswordSchema } from './crossword.model';
import { HashtagModule } from '@modules/hashtag/hashtag.module';
import { OpenAIService } from '@services/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Crossword.name, schema: CrosswordSchema },
    ]),
    HashtagModule,
  ],
  controllers: [CrosswordController],
  providers: [CrosswordService, OpenAIService],
  exports: [CrosswordService],
})
export class CrosswordModule {}
