import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RatingsModule } from './ratings/ratings.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PostSubmissionsModule } from './post-submissions/post-submissions.module';
import { ModerationModule } from './moderation/moderation.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PostsModule,
    UsersModule,
    AuthModule,
    RatingsModule,
    CloudinaryModule,
    PostSubmissionsModule,
    ModerationModule,
    FollowModule
  ],
})
export class AppModule {}
