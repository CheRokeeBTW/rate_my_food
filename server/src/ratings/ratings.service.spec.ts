import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { PrismaService } from 'prisma/prisma.service';
import { RatingHelper } from './helper/helper-functions';

describe('RatingsService', () => {
  let service: RatingsService;

  const prismaMock = {
    post: {
      findUnique: jest.fn(),
    },
    rating: {
      findUnique: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const ratingHelperMock = {
    checkRating: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: RatingHelper,
          useValue: ratingHelperMock,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRating', () => {
    it('should create a rating', async () => {
      const dto = {
        postId: 'post-1',
        value: 8,
      };

      const post = {
        id: 'post-1',
        title: 'Pizza',
      };

      const createdRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 8,
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.rating.findUnique.mockResolvedValue(null);
      prismaMock.rating.create.mockResolvedValue(createdRating);

      const result = await service.createRating(dto, 'user-1');

      expect(result).toEqual(createdRating);

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });

      expect(prismaMock.rating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 'user-1',
            postId: 'post-1',
          },
        },
      });

      expect(prismaMock.rating.create).toHaveBeenCalledWith({
        data: {
          value: 8,
          userId: 'user-1',
          postId: 'post-1',
        },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createRating(
          {
            postId: 'post-1',
            value: 8,
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.rating.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.rating.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already rated the post', async () => {
      const post = {
        id: 'post-1',
      };

      const existingRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 7,
      };

      prismaMock.post.findUnique.mockResolvedValue(post);
      prismaMock.rating.findUnique.mockResolvedValue(existingRating);

      await expect(
        service.createRating(
          {
            postId: 'post-1',
            value: 8,
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.rating.create).not.toHaveBeenCalled();
    });
  });

  describe('getRatings', () => {
    it('should return rating statistics', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
      });

      prismaMock.rating.aggregate.mockResolvedValue({
        _avg: {
          value: 8.5,
        },
        _count: {
          value: 4,
        },
      });

      const result = await service.getRatings('post-1');

      expect(result).toEqual({
        average: 8.5,
        count: 4,
      });

      expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'post-1',
        },
      });

      expect(prismaMock.rating.aggregate).toHaveBeenCalledWith({
        where: {
          postId: 'post-1',
        },
        _avg: {
          value: true,
        },
        _count: {
          value: true,
        },
      });
    });

    it('should return 0 average when there are no ratings', async () => {
      prismaMock.post.findUnique.mockResolvedValue({
        id: 'post-1',
      });

      prismaMock.rating.aggregate.mockResolvedValue({
        _avg: {
          value: null,
        },
        _count: {
          value: 0,
        },
      });

      const result = await service.getRatings('post-1');

      expect(result).toEqual({
        average: 0,
        count: 0,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        service.getRatings('post-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.rating.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('updateRating', () => {
    it('should update an existing rating', async () => {
      const existingRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 7,
      };

      const updatedRating = {
        ...existingRating,
        value: 9,
      };

      ratingHelperMock.checkRating.mockResolvedValue(existingRating);
      prismaMock.rating.update.mockResolvedValue(updatedRating);

      const result = await service.updateRating(
        'post-1',
        'user-1',
        {
          value: 9,
        },
      );

      expect(result).toEqual(updatedRating);

      expect(ratingHelperMock.checkRating).toHaveBeenCalledWith(
        'post-1',
        'user-1',
      );

      expect(prismaMock.rating.update).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 'user-1',
            postId: 'post-1',
          },
        },
        data: {
          value: 9,
        },
      });
    });

    it('should throw NotFoundException when rating does not exist', async () => {
      ratingHelperMock.checkRating.mockResolvedValue(null);

      await expect(
        service.updateRating(
          'post-1',
          'user-1',
          {
            value: 9,
          },
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.rating.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteRating', () => {
    it('should delete an existing rating', async () => {
      const rating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 8,
      };

      prismaMock.rating.delete.mockResolvedValue(rating);
      ratingHelperMock.checkRating.mockResolvedValue(rating);

      const result = await service.deleteRating(
        'post-1',
        'user-1',
      );

      expect(result).toEqual(rating);

      expect(ratingHelperMock.checkRating).toHaveBeenCalledWith(
        'post-1',
        'user-1',
      );

      expect(prismaMock.rating.delete).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 'user-1',
            postId: 'post-1',
          },
        },
      });
    });

    it('should throw ForbiddenException when rating does not exist', async () => {
      ratingHelperMock.checkRating.mockResolvedValue(null);

      await expect(
        service.deleteRating(
          'post-1',
          'user-1',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.rating.delete).not.toHaveBeenCalled();
    });
  });
});