import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

describe('UsersController', () => {
  let controller: UsersController;

  const usersMock = {
    getProfile: jest.fn(),
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const profile = {
        id: 'user-1',
        username: 'testuser',
        createdAt: new Date(),
        posts: [],
      };

      usersMock.getProfile.mockResolvedValue(profile);

      const req = {
        user: {
          sub: 'user-1',
        },
      };

      const result = await controller.getProfile(req as any);

      expect(result).toEqual(profile);

      expect(usersMock.getProfile).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('getUserId', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      };

      usersMock.getUserById.mockResolvedValue(user);

      const result = await controller.getUserId('user-1');

      expect(result).toEqual(user);

      expect(usersMock.getUserById).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should return null when user does not exist', async () => {
      usersMock.getUserById.mockResolvedValue(null);

      const result = await controller.getUserId('user-1');

      expect(result).toBeNull();

      expect(usersMock.getUserById).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });
});
