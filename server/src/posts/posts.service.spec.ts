import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from 'prisma/prisma.service';

describe('PostsService', () => {
  let service: PostsService;

  const prismaMock = {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    postView: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPosts', () => {
    it('should return all posts', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Pizza',
          imageUrl: 'pizza.jpg',
          authorId: 'user-1',
        },
        {
          id: 'post-2',
          title: 'Burger',
          imageUrl: 'burger.jpg',
          authorId: 'user-2',
        },
      ];

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getPosts();

      expect(result).toEqual(posts);

      expect(prismaMock.post.findMany).toHaveBeenCalledWith();
    });
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      const post = {
        id: 'post-1',
        title: 'Pizza',
        imageUrl: 'pizza.jpg',
        authorId: 'user-1',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);

      const result = await service.getPost('post-1');

      expect(result).toEqual(post);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.getPost('post-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });
    });
  });

  describe('getFeed', () => {
    it('should return feed for authenticated user', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Pizza',
          imageUrl: 'pizza.jpg',
          createdAt: new Date(),
          author: {
            id: 'user-1',
            username: 'john',
          },
        },
        {
          id: 'post-2',
          title: 'Burger',
          imageUrl: 'burger.jpg',
          createdAt: new Date(),
          author: {
            id: 'user-2',
            username: 'mike',
          },
        },
      ];

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(
        undefined,
        { userId: 'user-1' },
      );

      expect(result).toEqual({
        items: posts,
        nextCursor: null,
      });

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: {
          views: {
            none: {
              userId: 'user-1',
            },
          },
        },
        take: 6,
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
    });

    it('should return feed for anonymous visitor', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Pizza',
          imageUrl: 'pizza.jpg',
          createdAt: new Date(),
          author: {
            id: 'user-1',
            username: 'john',
          },
        },
      ];

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(
        undefined,
        { visitorId: 'visitor-123' },
      );

      expect(result).toEqual({
        items: posts,
        nextCursor: null,
      });

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: {
          views: {
            none: {
              visitorId: 'visitor-123',
            },
          },
        },
        take: 6,
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
    });

    it('should return only 5 posts and nextCursor when there are more posts', async () => {
      const posts = Array.from({ length: 6 }, (_, index) => ({
        id: `post-${index + 1}`,
        title: `Post ${index + 1}`,
        imageUrl: `image-${index + 1}.jpg`,
        createdAt: new Date(),
        author: {
          id: `user-${index + 1}`,
          username: `user${index + 1}`,
        },
      }));

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(
        undefined,
        { userId: 'user-1' },
      );

      expect(result.items).toHaveLength(5);
      expect(result.items).toEqual(posts.slice(0, 5));
      expect(result.nextCursor).toBe('post-5');
    });

    it('should use cursor pagination', async () => {
      const posts = [
        {
          id: 'post-2',
          title: 'Burger',
          imageUrl: 'burger.jpg',
          createdAt: new Date(),
          author: {
            id: 'user-2',
            username: 'mike',
          },
        },
      ];

      prismaMock.post.findMany.mockResolvedValue(posts);

      await service.getFeed(
        'post-1',
        { userId: 'user-1' },
      );

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: {
          views: {
            none: {
              userId: 'user-1',
            },
          },
        },
        take: 6,
        cursor: {
          id: 'post-1',
        },
        skip: 1,
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
    });

    it('should throw an error when visitor identity is missing', async () => {
      await expect(
        service.getFeed(undefined, {}),
      ).rejects.toThrow('No visitor identity');

      expect(prismaMock.post.findMany).not.toHaveBeenCalled();
    });
  });

  describe('markPostViewed', () => {
    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.markPostViewed('post-1', {
          userId: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.postView.upsert).not.toHaveBeenCalled();
    });

    it('should mark post as viewed by authenticated user', async () => {
      const post = {
        id: 'post-1',
        title: 'Pizza',
      };

      const view = {
        id: 'view-1',
        postId: 'post-1',
        userId: 'user-1',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.postView.upsert.mockResolvedValue(view);

      const result = await service.markPostViewed(
        'post-1',
        { userId: 'user-1' },
      );

      expect(result).toEqual(view);

      expect(prismaMock.postView.upsert).toHaveBeenCalledWith({
        where: {
          postId_userId: {
            postId: 'post-1',
            userId: 'user-1',
          },
        },
        update: {},
        create: {
          postId: 'post-1',
          userId: 'user-1',
        },
      });
    });

    it('should mark post as viewed by anonymous visitor', async () => {
      const post = {
        id: 'post-1',
        title: 'Pizza',
      };

      const view = {
        id: 'view-1',
        postId: 'post-1',
        visitorId: 'visitor-123',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.postView.upsert.mockResolvedValue(view);

      const result = await service.markPostViewed(
        'post-1',
        { visitorId: 'visitor-123' },
      );

      expect(result).toEqual(view);

      expect(prismaMock.postView.upsert).toHaveBeenCalledWith({
        where: {
          postId_visitorId: {
            postId: 'post-1',
            visitorId: 'visitor-123',
          },
        },
        update: {},
        create: {
          postId: 'post-1',
          visitorId: 'visitor-123',
        },
      });
    });

    it('should throw an error when visitor identity is missing', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
      });

      await expect(
        service.markPostViewed('post-1', {}),
      ).rejects.toThrow('No visitor identity');

      expect(prismaMock.postView.upsert).not.toHaveBeenCalled();
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const dto = {
        title: 'Pizza',
        imageUrl: 'pizza.jpg',
      };

      const createdPost = {
        id: 'post-1',
        title: 'Pizza',
        imageUrl: 'pizza.jpg',
        authorId: 'user-1',
      };

      prismaMock.post.create.mockResolvedValue(createdPost);

      const result = await service.createPost(dto, 'user-1');

      expect(result).toEqual(createdPost);

      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          imageUrl: dto.imageUrl,
          authorId: 'user-1',
        },
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const existingPost = {
        id: 'post-1',
        title: 'Old title',
        imageUrl: 'old.jpg',
      };

      const dto = {
        title: 'New title',
        imageUrl: 'new.jpg',
      };

      const updatedPost = {
        id: 'post-1',
        title: 'New title',
        imageUrl: 'new.jpg',
      };

      prismaMock.post.findUnique.mockResolvedValue(existingPost);
      prismaMock.post.update.mockResolvedValue(updatedPost);

      const result = await service.updatePost('post-1', dto);

      expect(result).toEqual(updatedPost);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });

      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
        data: dto,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePost('post-1', {
          title: 'New title',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.post.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete an existing post', async () => {
      const post = {
        id: 'post-1',
        title: 'Pizza',
        imageUrl: 'pizza.jpg',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.post.delete.mockResolvedValue(post);

      const result = await service.deletePost('post-1');

      expect(result).toEqual(post);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });

      expect(prismaMock.post.delete).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.deletePost('post-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.post.delete).not.toHaveBeenCalled();
    });
  });
});
