import { Controller, UseGuards, Post, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { CreatePostSubmissionDto } from './dto/create-post-submission.dto';
import { PostsService } from 'src/posts/posts.service';
import type { Request } from 'express';
import { PostSubmissionsService } from './post-submissions.service';

@Controller('post-submissions')
export class PostSubmissionsController {

    constructor(
        private readonly postSubmissionsService: PostSubmissionsService,
    ) {}

        @UseGuards(JwtAuthGuard)
        @Post()
        createSubmission(
        @Req() req: Request,
        @Body() dto: CreatePostSubmissionDto,
        ) {
            const userId = req.user!.sub;

            return this.postSubmissionsService.createSubmission(dto, userId);
        }
}
