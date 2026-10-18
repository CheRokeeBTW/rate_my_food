import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [FollowService],
  controllers: [FollowController],
  imports: [AuthModule],
  exports: [FollowService],
})
export class FollowModule {}
