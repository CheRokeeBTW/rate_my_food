import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from 'prisma/prisma.service';
import { createHash } from 'crypto';

describe('SessionsService', () => {
  let service: SessionsService;

  const prismaMock = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a refresh token session', async () => {
      const refreshToken = 'refresh-token';
      const userId = 'user-1';

      const createdSession = {
        id: 'session-1',
        tokenHash: createHash('sha256')
          .update(refreshToken)
          .digest('hex'),
        userId,
        expiresAt: expect.any(Date),
      };

      prismaMock.refreshToken.create.mockResolvedValue(createdSession);

      const result = await service.createSession({
        refreshToken,
        userId,
      });

      expect(result).toEqual(createdSession);

      expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          tokenHash: createHash('sha256')
            .update(refreshToken)
            .digest('hex'),
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('findSession', () => {
    it('should return a session when the refresh token exists', async () => {
      const refreshToken = 'refresh-token';

      const session = {
        id: 'session-1',
        tokenHash: createHash('sha256')
          .update(refreshToken)
          .digest('hex'),
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      };

      prismaMock.refreshToken.findUnique.mockResolvedValue(session);

      const result = await service.findSession(refreshToken);

      expect(result).toEqual(session);

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: {
          tokenHash: createHash('sha256')
            .update(refreshToken)
            .digest('hex'),
        },
      });
    });

    it('should throw NotFoundException when session does not exist', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.findSession('invalid-token'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revokeSession', () => {
    it('should revoke an existing session', async () => {
      const refreshToken = 'refresh-token';

      const session = {
        id: 'session-1',
        tokenHash: 'hash',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      };

      const revokedSession = {
        ...session,
        revokedAt: new Date(),
      };

      prismaMock.refreshToken.findUnique.mockResolvedValue(session);
      prismaMock.refreshToken.update.mockResolvedValue(revokedSession);

      const result = await service.revokeSession(refreshToken);

      expect(result).toEqual(revokedSession);

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
        where: {
          id: session.id,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when session does not exist', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeSession('invalid-token'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.refreshToken.update).not.toHaveBeenCalled();
    });
  });

  describe('rotateSession', () => {
    it('should revoke the old session and create a new session', async () => {
      const refreshToken = 'old-refresh-token';
      const userId = 'user-1';

      const transactionMock = {
        refreshToken: {
          updateMany: jest.fn().mockResolvedValue({
            count: 1,
          }),
          create: jest.fn().mockResolvedValue({
            id: 'new-session',
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(transactionMock);
      });

      const result = await service.rotateSession(
        refreshToken,
        userId,
      );

      expect(typeof result).toBe('string');
      expect(result).toHaveLength(128);

      expect(transactionMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          tokenHash: createHash('sha256')
            .update(refreshToken)
            .digest('hex'),
          userId,
          revokedAt: null,
          expiresAt: {
            gt: expect.any(Date),
          },
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });

      expect(transactionMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          tokenHash: expect.any(String),
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should throw UnauthorizedException when old session is invalid', async () => {
      const transactionMock = {
        refreshToken: {
          updateMany: jest.fn().mockResolvedValue({
            count: 0,
          }),
          create: jest.fn(),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(transactionMock);
      });

      await expect(
        service.rotateSession(
          'invalid-token',
          'user-1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        transactionMock.refreshToken.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when more than one session is updated', async () => {
      const transactionMock = {
        refreshToken: {
          updateMany: jest.fn().mockResolvedValue({
            count: 2,
          }),
          create: jest.fn(),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(transactionMock);
      });

      await expect(
        service.rotateSession(
          'refresh-token',
          'user-1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        transactionMock.refreshToken.create,
      ).not.toHaveBeenCalled();
    });
  });
});

