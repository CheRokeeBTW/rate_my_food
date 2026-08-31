import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guards';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  };

  const guardMock = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(guardMock)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call AuthService.registerUser', async () => {
      const dto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      const resultUser = {
        id: 'user-1',
        email: dto.email,
        username: dto.username,
      };

      authServiceMock.registerUser.mockResolvedValue(resultUser);

      const result = await controller.registerUser(dto);

      expect(result).toEqual(resultUser);

      expect(authServiceMock.registerUser).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('login', () => {
    it('should login and set refresh token cookie', async () => {
      authServiceMock.loginUser.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = {
        cookie: jest.fn(),
      } as any;

      const result = await controller.login(
        {
          email: 'test@test.com',
          password: 'password123',
        },
        response,
      );

      expect(result).toEqual({
        accessToken: 'access-token',
      });

      expect(authServiceMock.loginUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new refresh cookie', async () => {
      authServiceMock.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const request = {
        cookies: {
          refresh_token: 'old-refresh-token',
        },
      } as any;

      const response = {
        cookie: jest.fn(),
      } as any;

      const result = await controller.refresh(
        request,
        response,
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
      });

      expect(
        authServiceMock.refreshAccessToken,
      ).toHaveBeenCalledWith('old-refresh-token');

      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      );
    });

    it('should throw UnauthorizedException when refresh token is missing', async () => {
      const request = {
        cookies: {},
      } as any;

      const response = {
        cookie: jest.fn(),
      } as any;

      await expect(
        controller.refresh(request, response),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        authServiceMock.refreshAccessToken,
      ).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout and clear refresh cookie', async () => {
      const request = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      } as any;

      const response = {
        clearCookie: jest.fn(),
      } as any;

      const result = await controller.logout(
        request,
        response,
      );

      expect(result).toEqual({
        message: 'Logged out successfully',
      });

      expect(authServiceMock.logout).toHaveBeenCalledWith(
        'refresh-token',
      );

      expect(response.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
      );
    });

    it('should clear cookie even when refresh token is missing', async () => {
      const request = {
        cookies: {},
      } as any;

      const response = {
        clearCookie: jest.fn(),
      } as any;

      const result = await controller.logout(
        request,
        response,
      );

      expect(result).toEqual({
        message: 'Logged out successfully',
      });

      expect(authServiceMock.logout).not.toHaveBeenCalled();

      expect(response.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
      );
    });
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      };

      authServiceMock.getMe.mockResolvedValue(user);

      const request = {
        user: {
          sub: 'user-1',
        },
      } as any;

      const result = await controller.getMe(request);

      expect(result).toEqual(user);

      expect(authServiceMock.getMe).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should throw UnauthorizedException when user id is missing', () => {
      expect(() =>
        controller.getMe({
          user: {},
        } as any),
      ).toThrow(UnauthorizedException);

      expect(authServiceMock.getMe).not.toHaveBeenCalled();
    });
  });
});
