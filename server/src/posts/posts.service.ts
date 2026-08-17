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

  async getFeed(cursor?: string) {
  const take = 5;

  const posts = await this.prisma.post.findMany({
    take: take + 1,

    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),

    orderBy: {
      createdAt: 'desc',
    },

    select: {
      id: true,
      title: true,
      imageUrl: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const hasMore = posts.length > take;

  const items = hasMore
    ? posts.slice(0, take)
    : posts;

  return {
    items,
    nextCursor: hasMore
      ? items[items.length - 1].id
      : null,
  };
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
