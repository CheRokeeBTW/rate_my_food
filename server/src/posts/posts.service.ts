import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto/create-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdatePostDto } from './dto/create-post.dto/update-post.dto';
import { Prisma } from '@prisma/client';

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

async getFeed(
  cursor: string | undefined,
  visitor: {
    userId?: string;
    visitorId?: string;
  },
) {
  const take = 5;

  let where: Prisma.PostWhereInput;

  if (visitor.userId) {
    where = {
      views: {
        none: {
          userId: visitor.userId,
        },
      },
    };
  } else if (visitor.visitorId) {
    where = {
      views: {
        none: {
          visitorId: visitor.visitorId,
        },
      },
    };
  } else {
    throw new Error("No visitor identity");
  }

  const posts = await this.prisma.post.findMany({
    where,

    take: take + 1,

    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),

    orderBy: {
      createdAt: "desc",
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

  async markPostViewed(
    postId: string,
    visitor: {
      userId?: string;
      visitorId?: string;
    },
  ) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (visitor.userId) {
      return this.prisma.postView.upsert({
        where: {
          postId_userId: {
            postId,
            userId: visitor.userId,
          },
        },
        update: {},
        create: {
          postId,
          userId: visitor.userId,
        },
      });
    }

    if (visitor.visitorId) {
      return this.prisma.postView.upsert({
        where: {
          postId_visitorId: {
            postId,
            visitorId: visitor.visitorId,
          },
        },
        update: {},
        create: {
          postId,
          visitorId: visitor.visitorId,
        },
      });
    }

    throw new Error('No visitor identity');
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
