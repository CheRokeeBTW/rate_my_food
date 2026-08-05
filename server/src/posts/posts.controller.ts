import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto/create-post.dto.js';
import { UpdatePostDto } from './dto/create-post.dto/update-post.dto.js';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards.js';

@Controller('posts')
export class PostsController {

    constructor(
        private readonly postsService: PostsService,
    ) {}

    @Get()
    getPosts(){
        return this.postsService.getPosts();
    }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() dto: CreatePostDto, userId: string) {
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