import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto/create-post.dto';
import { UpdatePostDto } from './dto/create-post.dto/update-post.dto';

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

  @Post()
  createPost(@Body() dto: CreatePostDto) {
    return this.postsService.createPost(dto)
  }

  @Patch(':id')
  updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto
    ) {
        return this.postsService.updatePost(id, dto);
    }

    @Delete(':id')
    deletePost(
        @Param('id') id: string
    ) {
        return this.postsService.deletePost(id);
    }
}