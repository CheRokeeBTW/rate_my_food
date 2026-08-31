import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

describe('RatingsController', () => {
  let controller: RatingsController;

  const ratingsMock = {
    createRating: jest.fn(),
    updateRating: jest.fn(),
    deleteRating: jest.fn(),
    getRatings: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: ratingsMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<RatingsController>(RatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRating', () => {
    it('should create a rating for the current user', async () => {
      const dto = {
        postId: 'post-1',
        value: 8,
      };

      const request = {
        user: {
          sub: 'user-1',
        },
      } as any;

      const createdRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 8,
      };

      ratingsMock.createRating.mockResolvedValue(createdRating);

      const result = await controller.createRating(
        dto,
        request,
      );

      expect(result).toEqual(createdRating);

      expect(ratingsMock.createRating).toHaveBeenCalledWith(
        dto,
        'user-1',
      );
    });

    it('should throw UnauthorizedException when user id is missing', async () => {
      const request = {
        user: {},
      } as any;

      await expect(
        controller.createRating(
          {
            postId: 'post-1',
            value: 8,
          },
          request,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(ratingsMock.createRating).not.toHaveBeenCalled();
    });
  });

  describe('updateRating', () => {
    it('should update the current user rating', async () => {
      const request = {
        user: {
          sub: 'user-1',
        },
      } as any;

      const dto = {
        value: 9,
      };

      const updatedRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 9,
      };

      ratingsMock.updateRating.mockResolvedValue(updatedRating);

      const result = await controller.updateRating(
        'post-1',
        dto,
        request,
      );

      expect(result).toEqual(updatedRating);

      expect(ratingsMock.updateRating).toHaveBeenCalledWith(
        'post-1',
        'user-1',
        dto,
      );
    });

    it('should throw UnauthorizedException when user id is missing', async () => {
      const request = {
        user: {},
      } as any;

      await expect(
        controller.updateRating(
          'post-1',
          {
            value: 9,
          },
          request,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(ratingsMock.updateRating).not.toHaveBeenCalled();
    });
  });

  describe('deleteRating', () => {
    it('should delete the current user rating', async () => {
      const request = {
        user: {
          sub: 'user-1',
        },
      } as any;

      const deletedRating = {
        id: 'rating-1',
        postId: 'post-1',
        userId: 'user-1',
        value: 8,
      };

      ratingsMock.deleteRating.mockResolvedValue(deletedRating);

      const result = await controller.deleteRating(
        'post-1',
        request,
      );

      expect(result).toEqual(deletedRating);

      expect(ratingsMock.deleteRating).toHaveBeenCalledWith(
        'post-1',
        'user-1',
      );
    });

    it('should throw UnauthorizedException when user id is missing', async () => {
      const request = {
        user: {},
      } as any;

      await expect(
        controller.deleteRating(
          'post-1',
          request,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(ratingsMock.deleteRating).not.toHaveBeenCalled();
    });
  });

  describe('getRatingStats', () => {
    it('should return rating statistics', async () => {
      const stats = {
        average: 8.5,
        count: 4,
      };

      ratingsMock.getRatings.mockResolvedValue(stats);

      const result = await controller.getRatingStats('post-1');

      expect(result).toEqual(stats);

      expect(ratingsMock.getRatings).toHaveBeenCalledWith(
        'post-1',
      );
    });
  });
});