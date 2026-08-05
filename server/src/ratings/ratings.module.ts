import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { RatingHelper } from './helper/helper-functions';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, RatingHelper],
  exports: [RatingsService],
})
export class RatingsModule {}
