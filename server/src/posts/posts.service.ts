import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto/create-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdatePostDto } from './dto/create-post.dto/update-post.dto';

@Injectable()
export class PostsService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  getPosts() {
    return this.prisma.post.findMany();
  }

  async getPost(id: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
        throw new NotFoundException('Post not found');
    };

    return post;
  }

  createPost(dto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        authorId: userId,
      },
    });
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
        where: {
            id,
        },
    })

    if (!post) {
        throw new NotFoundException('Post not found');
    };

    return this.prisma.post.update({
        where: {
        id,
        },
        data: dto,
    });
  }

  async deletePost(id: string) {
    const post = await this.prisma.post.findUnique({
        where: {
            id,
        }
    })

        if (!post) {
        throw new NotFoundException('Post not found');
    };

    return this.prisma.post.delete({
    where: {
        id,
        },
    });

  }
}
