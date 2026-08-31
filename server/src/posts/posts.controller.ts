import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, Req, Res, Query } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto/create-post.dto.js';
import { UpdatePostDto } from './dto/create-post.dto/update-post.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards.js';
import type { Request, Response } from 'express';
import { getVisitorKey } from '../utils/visitorKey.js';

@Controller('posts')
export class PostsController {

    constructor(
        private readonly postsService: PostsService,
    ) {}

    @Get()
    getPosts(){
        return this.postsService.getPosts();
    }

  @Get('feed')
  getFeed(
    @Query('cursor') cursor: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const visitor = getVisitorKey(req, res);

    return this.postsService.getFeed(cursor, visitor);
  }

  @Post(':id/view')
  markPostViewed(
    @Param('id') id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const visitor = getVisitorKey(req, res);

    return this.postsService.markPostViewed(id, visitor);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }  

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(
    @Body() dto: CreatePostDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.sub;

    return this.postsService.createPost(dto, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto
    ) {
        return this.postsService.updatePost(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deletePost(
        @Param('id') id: string
    ) {
        return this.postsService.deletePost(id);
    }
}