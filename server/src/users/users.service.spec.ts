import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const cloudinaryMock = {
    deleteImage: jest.fn(),
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
        CloudinaryService,
        {
          provide: CloudinaryService,
          useValue: cloudinaryMock,
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateAvatar', () => {
  it('should update the avatar and delete the previous image', async () => {
    const dto = {
      newAvatar: 'https://res.cloudinary.com/demo/image/upload/new.jpg',
      publicId: 'avatars/new',
    };

    const oldAvatar = {
      avatarPublicId: 'avatars/old',
    };

    const updatedUser = {
      id: 'user-1',
      username: 'testuser',
      avatarUrl: dto.newAvatar,
    };

    prismaMock.user.findUnique.mockResolvedValue(oldAvatar);
    prismaMock.user.update.mockResolvedValue(updatedUser);
    cloudinaryMock.deleteImage.mockResolvedValue({ result: 'ok' });

    const result = await service.updateAvatar('user-1', dto);

    expect(result).toEqual(updatedUser);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: {
          avatarUrl: dto.newAvatar,
          avatarPublicId: dto.publicId,
        },
      }),
    );

    expect(cloudinaryMock.deleteImage).toHaveBeenCalledWith(
      'avatars/old',
    );
  });

  it('should not delete the image if the public ID has not changed', async () => {
    const dto = {
      newAvatar: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
      publicId: 'avatars/current',
    };

    prismaMock.user.findUnique.mockResolvedValue({
      avatarPublicId: 'avatars/current',
    });

    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      avatarUrl: dto.newAvatar,
    });

    await service.updateAvatar('user-1', dto);

    expect(cloudinaryMock.deleteImage).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.updateAvatar('user-1', {
        newAvatar: 'https://res.cloudinary.com/demo/image/upload/new.jpg',
        publicId: 'avatars/new',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

describe('deleteAvatar', () => {
  it('should remove the avatar and delete the Cloudinary image', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      avatarPublicId: 'avatars/current',
    });

    const updatedUser = {
      id: 'user-1',
      username: 'testuser',
      avatarUrl: null,
    };

    prismaMock.user.update.mockResolvedValue(updatedUser);
    cloudinaryMock.deleteImage.mockResolvedValue({ result: 'ok' });

    const result = await service.deleteAvatar('user-1');

    expect(result).toEqual(updatedUser);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: {
          avatarUrl: null,
          avatarPublicId: null,
        },
      }),
    );

    expect(cloudinaryMock.deleteImage).toHaveBeenCalledWith(
      'avatars/current',
    );
  });

  it('should return a null avatar when the user has no avatar', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      avatarPublicId: null,
    });

    const result = await service.deleteAvatar('user-1');

    expect(result).toEqual({
      id: 'user-1',
      username: 'testuser',
      avatarUrl: null,
    });

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(cloudinaryMock.deleteImage).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.deleteAvatar('user-1')).rejects.toThrow(
      NotFoundException,
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(cloudinaryMock.deleteImage).not.toHaveBeenCalled();
  });

  it('should still return success if Cloudinary deletion fails', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      avatarPublicId: 'avatars/current',
    });

    const updatedUser = {
      id: 'user-1',
      username: 'testuser',
      avatarUrl: null,
    };

    prismaMock.user.update.mockResolvedValue(updatedUser);
    cloudinaryMock.deleteImage.mockRejectedValue(
      new Error('Cloudinary unavailable'),
    );

    const result = await service.deleteAvatar('user-1');

    expect(result).toEqual(updatedUser);
  });
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
            ratingCount: 3,
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
            ratingCount: 0,
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

  describe('updateUsername', () => {
    it('should update the username', async () => {
      const dto = {
        newUsername: 'newname',
      };

      const updatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'newname',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUsername('user-1', dto);

      expect(result).toEqual(updatedUser);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          username: 'newname',
        },
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          username: 'newname',
        },
      });
    });

    it('should throw ConflictException if username is already taken', async () => {
      const dto = {
        newUsername: 'existinguser',
      };

      const existingUser = {
        id: 'user-2',
        username: 'existinguser',
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.updateUsername('user-1', dto),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          username: 'existinguser',
        },
      });

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should allow the user to keep their current username', async () => {
      const dto = {
        newUsername: 'testuser',
      };

      const existingUser = {
        id: 'user-1',
        username: 'testuser',
      };

      const updatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUsername('user-1', dto);

      expect(result).toEqual(updatedUser);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          username: 'testuser',
        },
      });
    });
  });
});
