import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { RatingHelper } from './helper/helper-functions';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, RatingHelper],
  imports: [AuthModule],
  exports: [RatingsService],
})
export class RatingsModule {}
