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
  };

  beforeEach(async () => {
    jest.resetAllMocks();

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

      await expect(service.getPosts()).resolves.toEqual(posts);

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

      await expect(service.getPost('post-1')).resolves.toEqual(post);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(service.getPost('post-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });
    });
  });

  describe('getFeed', () => {
    const expectedSelect = {
      id: true,
      title: true,
      tags: true,
      imageUrl: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    };

    const makePost = (index: number) => ({
      id: `post-${index}`,
      title: `Post ${index}`,
      tags: ['food'],
      imageUrl: `image-${index}.jpg`,
      createdAt: new Date(`2026-01-${String(index).padStart(2, '0')}T12:00:00Z`),
      author: {
        id: `user-${index}`,
        username: `user${index}`,
      },
    });

    it('should return feed for an authenticated user', async () => {
      const posts = [makePost(1), makePost(2)];

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(undefined, {
        userId: 'user-1',
      });

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
        take: 11,
        orderBy: {
          createdAt: 'desc',
        },
        select: expectedSelect,
      });
    });

    it('should return feed for an anonymous visitor', async () => {
      const posts = [makePost(1)];

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(undefined, {
        visitorId: 'visitor-123',
      });

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
        take: 11,
        orderBy: {
          createdAt: 'desc',
        },
        select: expectedSelect,
      });
    });

    it('should return only 10 posts and a nextCursor when more posts exist', async () => {
      const posts = Array.from({ length: 11 }, (_, index) =>
        makePost(index + 1),
      );

      prismaMock.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed(undefined, {
        userId: 'user-1',
      });

      expect(result.items).toHaveLength(10);
      expect(result.items).toEqual(posts.slice(0, 10));
      expect(result.nextCursor).toBe('post-10');
    });

    it('should use cursor pagination', async () => {
      const posts = [makePost(2)];

      prismaMock.post.findMany.mockResolvedValue(posts);

      await service.getFeed('post-1', {
        userId: 'user-1',
      });

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: {
          views: {
            none: {
              userId: 'user-1',
            },
          },
        },
        take: 11,
        cursor: {
          id: 'post-1',
        },
        skip: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: expectedSelect,
      });
    });

    it('should throw an error when visitor identity is missing', async () => {
      await expect(service.getFeed(undefined, {})).rejects.toThrow(
        'No visitor identity',
      );

      expect(prismaMock.post.findMany).not.toHaveBeenCalled();
    });

    it('should prefer userId when both visitor identifiers are provided', async () => {
      prismaMock.post.findMany.mockResolvedValue([]);

      await service.getFeed(undefined, {
        userId: 'user-1',
        visitorId: 'visitor-123',
      });

      expect(prismaMock.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            views: {
              none: {
                userId: 'user-1',
              },
            },
          },
        }),
      );
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

    it('should mark a post as viewed by an authenticated user', async () => {
      const post = { id: 'post-1', title: 'Pizza' };

      const view = {
        id: 'view-1',
        postId: 'post-1',
        userId: 'user-1',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.postView.upsert.mockResolvedValue(view);

      await expect(
        service.markPostViewed('post-1', {
          userId: 'user-1',
        }),
      ).resolves.toEqual(view);

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

    it('should mark a post as viewed by an anonymous visitor', async () => {
      const post = { id: 'post-1', title: 'Pizza' };

      const view = {
        id: 'view-1',
        postId: 'post-1',
        visitorId: 'visitor-123',
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.postView.upsert.mockResolvedValue(view);

      await expect(
        service.markPostViewed('post-1', {
          visitorId: 'visitor-123',
        }),
      ).resolves.toEqual(view);

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

    it('should prefer userId when both visitor identifiers are provided', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
      });

      prismaMock.postView.upsert.mockResolvedValue({
        id: 'view-1',
      });

      await service.markPostViewed('post-1', {
        userId: 'user-1',
        visitorId: 'visitor-123',
      });

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
  });

  describe('createPost', () => {
    it('should create a post with its author and tags', async () => {
      const dto = {
        title: 'Pizza',
        tags: ['italian', 'dinner'],
        imageUrl: 'pizza.jpg',
      };

      const createdPost = {
        id: 'post-1',
        ...dto,
        authorId: 'user-1',
      };

      prismaMock.post.create.mockResolvedValue(createdPost);

      await expect(
        service.createPost(dto, 'user-1'),
      ).resolves.toEqual(createdPost);

      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          tags: dto.tags,
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
        ...existingPost,
        ...dto,
      };

      prismaMock.post.findUnique.mockResolvedValue(existingPost);
      prismaMock.post.update.mockResolvedValue(updatedPost);

      await expect(
        service.updatePost('post-1', dto),
      ).resolves.toEqual(updatedPost);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });

      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
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

      await expect(service.deletePost('post-1')).resolves.toEqual(post);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });

      expect(prismaMock.post.delete).toHaveBeenCalledWith({
        where: { id: 'post-1' },
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
