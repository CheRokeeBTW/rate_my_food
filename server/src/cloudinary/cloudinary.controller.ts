import {
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('signature')
  getUploadSignature(@Req() req: Request) {
    const timestamp = Math.floor(Date.now() / 1000);

    const userId = req.user!.sub;

    const folder = `rate-my-food/users/${userId}`;

    return this.cloudinaryService.generateUploadSignature(
      timestamp,
      folder,
    );
  }
}