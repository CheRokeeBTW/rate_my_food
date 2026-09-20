import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ModerationController],
  providers: [ModerationService],
  imports: [AuthModule, CloudinaryModule],
})
export class ModerationModule {}
