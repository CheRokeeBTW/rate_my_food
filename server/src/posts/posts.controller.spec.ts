import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { getVisitorKey } from '../utils/visitorKey';

jest.mock('../utils/visitorKey');

describe('PostsController', () => {
  let controller: PostsController;

  const postsServiceMock = {
    getPosts: jest.fn(),
    getFeed: jest.fn(),
    markPostViewed: jest.fn(),
    getPost: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  const getVisitorKeyMock = getVisitorKey as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: postsServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPosts', () => {
    it('should return all posts', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Pizza',
        },
        {
          id: 'post-2',
          title: 'Burger',
        },
      ];

      postsServiceMock.getPosts.mockResolvedValue(posts);

      const result = await controller.getPosts();

      expect(result).toEqual(posts);
      expect(postsServiceMock.getPosts).toHaveBeenCalled();
    });
  });

  describe('getFeed', () => {
    it('should get visitor identity and return feed', async () => {
      const visitor = {
        userId: 'user-1',
      };

      const feed = {
        items: [
          {
            id: 'post-1',
            title: 'Pizza',
          },
        ],
        nextCursor: null,
      };

      getVisitorKeyMock.mockReturnValue(visitor);
      postsServiceMock.getFeed.mockResolvedValue(feed);

      const req = {} as any;
      const res = {} as any;

      const result = await controller.getFeed(
        undefined,
        req,
        res,
      );

      expect(result).toEqual(feed);

      expect(getVisitorKeyMock).toHaveBeenCalledWith(
        req,
        res,
      );

      expect(postsServiceMock.getFeed).toHaveBeenCalledWith(
        undefined,
        visitor,
      );
    });

    it('should pass cursor to PostsService', async () => {
      const visitor = {
        visitorId: 'visitor-123',
      };

      getVisitorKeyMock.mockReturnValue(visitor);
      postsServiceMock.getFeed.mockResolvedValue({
        items: [],
        nextCursor: null,
      });

      const req = {} as any;
      const res = {} as any;

      await controller.getFeed(
        'post-10',
        req,
        res,
      );

      expect(postsServiceMock.getFeed).toHaveBeenCalledWith(
        'post-10',
        visitor,
      );
    });
  });

  describe('markPostViewed', () => {
    it('should mark a post as viewed', async () => {
      const visitor = {
        userId: 'user-1',
      };

      const view = {
        id: 'view-1',
        postId: 'post-1',
        userId: 'user-1',
      };

      getVisitorKeyMock.mockReturnValue(visitor);
      postsServiceMock.markPostViewed.mockResolvedValue(view);

      const req = {} as any;
      const res = {} as any;

      const result = await controller.markPostViewed(
        'post-1',
        req,
        res,
      );

      expect(result).toEqual(view);

      expect(getVisitorKeyMock).toHaveBeenCalledWith(
        req,
        res,
      );

      expect(postsServiceMock.markPostViewed).toHaveBeenCalledWith(
        'post-1',
        visitor,
      );
    });
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      const post = {
        id: 'post-1',
        title: 'Pizza',
      };

      postsServiceMock.getPost.mockResolvedValue(post);

      const result = await controller.getPost('post-1');

      expect(result).toEqual(post);

      expect(postsServiceMock.getPost).toHaveBeenCalledWith(
        'post-1',
      );
    });
  });

  describe('createPost', () => {
    it('should create a post using the authenticated user id', async () => {
      const dto = {
        title: 'Pizza',
        imageUrl: 'pizza.jpg',
      };

      const createdPost = {
        id: 'post-1',
        ...dto,
        authorId: 'user-1',
      };

      postsServiceMock.createPost.mockResolvedValue(createdPost);

      const req = {
        user: {
          sub: 'user-1',
        },
      } as any;

      const result = await controller.createPost(dto, req);

      expect(result).toEqual(createdPost);

      expect(postsServiceMock.createPost).toHaveBeenCalledWith(
        dto,
        'user-1',
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const dto = {
        title: 'Updated Pizza',
      };

      const updatedPost = {
        id: 'post-1',
        title: 'Updated Pizza',
      };

      postsServiceMock.updatePost.mockResolvedValue(updatedPost);

      const result = await controller.updatePost(
        'post-1',
        dto,
      );

      expect(result).toEqual(updatedPost);

      expect(postsServiceMock.updatePost).toHaveBeenCalledWith(
        'post-1',
        dto,
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const deletedPost = {
        id: 'post-1',
        title: 'Pizza',
      };

      postsServiceMock.deletePost.mockResolvedValue(deletedPost);

      const result = await controller.deletePost('post-1');

      expect(result).toEqual(deletedPost);

      expect(postsServiceMock.deletePost).toHaveBeenCalledWith(
        'post-1',
      );
    });
  });
});
