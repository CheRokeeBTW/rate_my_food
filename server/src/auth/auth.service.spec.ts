import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from './sessions/sessions.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersMock = {
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
  };

  const jwtMock = {
    sign: jest.fn(),
  };

  const sessionsMock = {
    createSession: jest.fn(),
    findSession: jest.fn(),
    rotateSession: jest.fn(),
    revokeSession: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: SessionsService,
          useValue: sessionsMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const dto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      const createdUser = {
        id: 'user-1',
        email: dto.email,
        username: dto.username,
        password: 'hashed-password',
      };

      usersMock.getUserByEmail.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      usersMock.createUser.mockResolvedValue(createdUser);

      const result = await service.registerUser(dto);

      expect(result).toEqual({
        id: 'user-1',
        email: dto.email,
        username: dto.username,
      });

      expect(usersMock.getUserByEmail).toHaveBeenCalledWith(
        dto.email,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(
        dto.password,
        10,
      );

      expect(usersMock.createUser).toHaveBeenCalledWith({
        email: dto.email,
        username: dto.username,
        password: 'hashed-password',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed-password',
      };

      usersMock.getUserByEmail.mockResolvedValue(existingUser);

      await expect(
        service.registerUser({
          email: 'test@test.com',
          username: 'anotheruser',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersMock.createUser).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed-password',
      };

      usersMock.getUserByEmail.mockResolvedValue(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtMock.sign.mockReturnValue('access-token');

      sessionsMock.createSession.mockResolvedValue({
        id: 'session-1',
      });

      const result = await service.loginUser({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.refreshToken).toHaveLength(128);

      expect(usersMock.getUserByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );

      expect(jwtMock.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user-1',
      });

      expect(sessionsMock.createSession).toHaveBeenCalledWith({
        refreshToken: expect.any(String),
        userId: 'user-1',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersMock.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.loginUser({
          email: 'wrong@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtMock.sign).not.toHaveBeenCalled();
      expect(sessionsMock.createSession).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed-password',
      };

      usersMock.getUserByEmail.mockResolvedValue(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.loginUser({
          email: 'test@test.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtMock.sign).not.toHaveBeenCalled();
      expect(sessionsMock.createSession).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return user without password', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed-password',
      };

      usersMock.getUserById.mockResolvedValue(user);

      const result = await service.getMe('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      });

      expect(result).not.toHaveProperty('password');

      expect(usersMock.getUserById).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersMock.getUserById.mockResolvedValue(null);

      await expect(
        service.getMe('user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access and refresh tokens', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      };

      sessionsMock.findSession.mockResolvedValue(session);

      sessionsMock.rotateSession.mockResolvedValue(
        'new-refresh-token',
      );

      jwtMock.sign.mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken(
        'old-refresh-token',
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(sessionsMock.findSession).toHaveBeenCalledWith(
        'old-refresh-token',
      );

      expect(sessionsMock.rotateSession).toHaveBeenCalledWith(
        'old-refresh-token',
        'user-1',
      );

      expect(jwtMock.sign).toHaveBeenCalledWith({
        sub: 'user-1',
      });
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      };

      sessionsMock.findSession.mockResolvedValue(session);

      await expect(
        service.refreshAccessToken('refresh-token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionsMock.rotateSession).not.toHaveBeenCalled();
      expect(jwtMock.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 100000),
      };

      sessionsMock.findSession.mockResolvedValue(session);

      await expect(
        service.refreshAccessToken('refresh-token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionsMock.rotateSession).not.toHaveBeenCalled();
      expect(jwtMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token session', async () => {
      sessionsMock.revokeSession.mockResolvedValue({
        id: 'session-1',
      });

      await service.logout('refresh-token');

      expect(sessionsMock.revokeSession).toHaveBeenCalledWith(
        'refresh-token',
      );
    });
  });
});
