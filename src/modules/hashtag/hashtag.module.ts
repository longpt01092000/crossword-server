import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HashtagController } from './hashtag.controller';
import { HashtagService } from './hashtag.service';
import { Hashtag, HashtagSchema } from './hashtag.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
  ],
  controllers: [HashtagController],
  providers: [HashtagService],
  exports: [HashtagService],
})
export class HashtagModule {}
