import { Module } from '@nestjs/common';
import { PostSubmissionsController } from './post-submissions.controller';
import { PostSubmissionsService } from './post-submissions.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PostSubmissionsController],
  providers: [PostSubmissionsService],
  imports: [AuthModule],
})
export class PostSubmissionsModule {}
