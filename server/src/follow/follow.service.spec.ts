
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from './follow.service';
import { PrismaService } from 'prisma/prisma.service';

describe('FollowService', () => {
  let service: FollowService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    follow: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
  });

  describe('followUser', () => {
    it('should create a follow relationship', async () => {
      const result = {
        followerId: 'user-1',
        followingId: 'user-2',
      };

      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-2' })
        .mockResolvedValueOnce({ id: 'user-1' });

      prismaMock.follow.upsert.mockResolvedValue(result);

      await expect(
        service.followUser('user-1', 'user-2'),
      ).resolves.toEqual(result);

      expect(prismaMock.follow.upsert).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: 'user-1',
            followingId: 'user-2',
          },
        },
        create: {
          followerId: 'user-1',
          followingId: 'user-2',
        },
        update: {},
      });
    });

    it('should throw NotFoundException if the target user does not exist', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'user-1' });

      await expect(
        service.followUser('user-1', 'missing-user'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.follow.upsert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the follower does not exist', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-2' })
        .mockResolvedValueOnce(null);

      await expect(
        service.followUser('missing-user', 'user-2'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.follow.upsert).not.toHaveBeenCalled();
    });

    it('should prevent users from following themselves', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-1' });

      await expect(
        service.followUser('user-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.follow.upsert).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should delete an existing follow relationship', async () => {
      const result = {
        followerId: 'user-1',
        followingId: 'user-2',
      };

      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-2' })
        .mockResolvedValueOnce({ id: 'user-1' });

      prismaMock.follow.findUnique.mockResolvedValue(result);
      prismaMock.follow.delete.mockResolvedValue(result);

      await expect(
        service.unfollowUser('user-1', 'user-2'),
      ).resolves.toEqual(result);

      expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: 'user-1',
            followingId: 'user-2',
          },
        },
      });

      expect(prismaMock.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: 'user-1',
            followingId: 'user-2',
          },
        },
      });
    });

    it('should throw NotFoundException if the target user does not exist', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'user-1' });

      await expect(
        service.unfollowUser('user-1', 'missing-user'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.follow.delete).not.toHaveBeenCalled();
    });

    it('should prevent users from unfollowing themselves', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-1' });

      await expect(
        service.unfollowUser('user-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.follow.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the follow relationship does not exist', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'user-2' })
        .mockResolvedValueOnce({ id: 'user-1' });

      prismaMock.follow.findUnique.mockResolvedValue(null);

      await expect(
        service.unfollowUser('user-1', 'user-2'),
      ).rejects.toThrow(
        new NotFoundException('You do not follow this user'),
      );

      expect(prismaMock.follow.delete).not.toHaveBeenCalled();
    });
  });

  describe('showFollowers', () => {
    it('should return followers and a null cursor when there are no more results', async () => {
      const follows = [
        {
          followerId: 'user-2',
          follower: {
            id: 'user-2',
            username: 'alice',
            avatarUrl: null,
          },
        },
      ];

      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prismaMock.follow.findMany.mockResolvedValue(follows);

      await expect(
        service.showFollowers('user-1'),
      ).resolves.toEqual({
        items: [
          {
            id: 'user-2',
            username: 'alice',
            avatarUrl: null,
          },
        ],
        nextCursor: null,
      });

      expect(prismaMock.follow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { followingId: 'user-1' },
          take: 21,
        }),
      );
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.showFollowers('missing-user'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.follow.findMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for an invalid cursor', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prismaMock.follow.findUnique.mockResolvedValue(null);

      await expect(
        service.showFollowers('user-1', 'missing-cursor'),
      ).rejects.toThrow(
        new BadRequestException('Invalid pagination cursor'),
      );

      expect(prismaMock.follow.findMany).not.toHaveBeenCalled();
    });

    it('should return a nextCursor when there are more than 20 followers', async () => {
      const follows = Array.from({ length: 21 }, (_, index) => {
        const id = `user-${index + 2}`;

        return {
          followerId: id,
          follower: {
            id,
            username: `username-${index + 2}`,
            avatarUrl: null,
          },
        };
      });

      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prismaMock.follow.findMany.mockResolvedValue(follows);

      const result = await service.showFollowers('user-1');

      expect(result.items).toHaveLength(20);
      expect(result.nextCursor).toBe('user-21');
    });

    it('should use the cursor to fetch the next page', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

      prismaMock.follow.findUnique.mockResolvedValue({
        followerId: 'user-5',
        followingId: 'user-1',
      });

      prismaMock.follow.findMany.mockResolvedValue([]);

      await service.showFollowers('user-1', 'user-5');

      expect(prismaMock.follow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { followingId: 'user-1' },
          cursor: {
            followerId_followingId: {
              followerId: 'user-5',
              followingId: 'user-1',
            },
          },
          skip: 1,
        }),
      );
    });
  });
});
