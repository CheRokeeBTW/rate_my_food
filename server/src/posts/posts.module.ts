import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [AuthModule],
})
export class PostsModule {}
