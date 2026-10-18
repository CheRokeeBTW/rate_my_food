
import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import type { Request } from 'express';

describe('FollowController', () => {
  let controller: FollowController;

  const followServiceMock = {
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    showFollowers: jest.fn(),
  };

  const mockRequest = (sub?: string) =>
    ({
      user: sub ? { sub } : {},
    }) as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: followServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FollowController>(FollowController);
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const result = { followerId: 'user-1', followingId: 'user-2' };
      followServiceMock.followUser.mockResolvedValue(result);

      await expect(
        controller.followUser('user-2', mockRequest('user-1')),
      ).resolves.toEqual(result);

      expect(followServiceMock.followUser).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
    });

    it('should throw UnauthorizedException when the user ID is missing', () => {
      expect(() =>
        controller.followUser('user-2', mockRequest()),
      ).toThrow(UnauthorizedException);

      expect(followServiceMock.followUser).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      const result = { followerId: 'user-1', followingId: 'user-2' };
      followServiceMock.unfollowUser.mockResolvedValue(result);

      await expect(
        controller.unfollowUser('user-2', mockRequest('user-1')),
      ).resolves.toEqual(result);

      expect(followServiceMock.unfollowUser).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
    });

    it('should throw UnauthorizedException when the user ID is missing', () => {
      expect(() =>
        controller.unfollowUser('user-2', mockRequest()),
      ).toThrow(UnauthorizedException);

      expect(followServiceMock.unfollowUser).not.toHaveBeenCalled();
    });
  });

  describe('getFollowers', () => {
    it('should return followers without a cursor', async () => {
      const result = { items: [], nextCursor: null };
      followServiceMock.showFollowers.mockResolvedValue(result);

      await expect(
        controller.getFollowers(undefined, mockRequest('user-1')),
      ).resolves.toEqual(result);

      expect(followServiceMock.showFollowers).toHaveBeenCalledWith(
        'user-1',
        undefined,
      );
    });

    it('should pass the cursor to the service', async () => {
      followServiceMock.showFollowers.mockResolvedValue({
        items: [],
        nextCursor: null,
      });

      await controller.getFollowers('cursor-user', mockRequest('user-1'));

      expect(followServiceMock.showFollowers).toHaveBeenCalledWith(
        'user-1',
        'cursor-user',
      );
    });

    it('should throw UnauthorizedException when the user ID is missing', () => {
      expect(() =>
        controller.getFollowers(undefined, mockRequest()),
      ).toThrow(UnauthorizedException);

      expect(followServiceMock.showFollowers).not.toHaveBeenCalled();
    });
  });
});
