import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(user);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
      });
    });

    it('should return null if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByEmail('test@test.com');

      expect(result).toEqual(user);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'test@test.com',
        },
      });
    });

    it('should return null if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByEmail('test@test.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const dto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      const createdUser = {
        id: 'user-1',
        ...dto,
      };

      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(dto);

      expect(result).toEqual(createdUser);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          username: dto.username,
          password: dto.password,
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return profile with average ratings', async () => {
      const createdAt = new Date();

      const user = {
        id: 'user-1',
        username: 'testuser',
        createdAt,
        posts: [
          {
            id: 'post-1',
            title: 'Pizza',
            imageUrl: 'pizza.jpg',
            createdAt,
            ratings: [
              { value: 8 },
              { value: 10 },
              { value: 6 },
            ],
          },
        ],
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        id: 'user-1',
        username: 'testuser',
        createdAt,
        posts: [
          {
            id: 'post-1',
            title: 'Pizza',
            imageUrl: 'pizza.jpg',
            createdAt,
            averageRating: 8,
          },
        ],
      });
    });

    it('should return null averageRating when post has no ratings', async () => {
      const createdAt = new Date();

      const user = {
        id: 'user-1',
        username: 'testuser',
        createdAt,
        posts: [
          {
            id: 'post-1',
            title: 'Pizza',
            imageUrl: 'pizza.jpg',
            createdAt,
            ratings: [],
          },
        ],
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        id: 'user-1',
        username: 'testuser',
        createdAt,
        posts: [
          {
            id: 'post-1',
            title: 'Pizza',
            imageUrl: 'pizza.jpg',
            createdAt,
            averageRating: null,
          },
        ],
      });
    });

    it('should calculate averages for multiple posts', async () => {
      const createdAt = new Date();

      const user = {
        id: 'user-1',
        username: 'testuser',
        createdAt,
        posts: [
          {
            id: 'post-1',
            title: 'Pizza',
            imageUrl: 'pizza.jpg',
            createdAt,
            ratings: [
              { value: 10 },
              { value: 8 },
            ],
          },
          {
            id: 'post-2',
            title: 'Burger',
            imageUrl: 'burger.jpg',
            createdAt,
            ratings: [
              { value: 5 },
              { value: 7 },
              { value: 9 },
            ],
          },
        ],
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('user-1');

      expect(result.posts[0].averageRating).toBe(9);
      expect(result.posts[1].averageRating).toBe(7);
    });
  });
});
