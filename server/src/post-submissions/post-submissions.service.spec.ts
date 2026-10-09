import { Test, TestingModule } from '@nestjs/testing';
import { PostSubmissionsService } from './post-submissions.service';
import { PrismaService } from 'prisma/prisma.service';

describe('PostSubmissionsService', () => {
  let service: PostSubmissionsService;

  const prismaServiceMock = {
    postSubmission: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostSubmissionsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<PostSubmissionsService>(
      PostSubmissionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubmission', () => {
    const dto = {
      title: 'Homemade pizza',
      imageUrl: 'https://example.com/pizza.jpg',
      tags: ['italian', 'dinner'],
      publicId: 'rate-my-food/pizza123',
    };

    const userId = 'user-123';

    it('should create a post submission with the correct data', async () => {
      const expectedSubmission = {
        id: 'submission-123',
        ...dto,
        authorId: userId,
        status: 'PENDING',
      };

      prismaServiceMock.postSubmission.create.mockResolvedValue(
        expectedSubmission,
      );

      const result = await service.createSubmission(dto, userId);

      expect(prismaServiceMock.postSubmission.create).toHaveBeenCalledTimes(1);

      expect(prismaServiceMock.postSubmission.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          imageUrl: dto.imageUrl,
          tags: dto.tags,
          publicId: dto.publicId,
          authorId: userId,
        },
      });

      expect(result).toEqual(expectedSubmission);
    });

    it('should propagate errors when Prisma creation fails', async () => {
      const error = new Error('Database error');

      prismaServiceMock.postSubmission.create.mockRejectedValue(error);

      await expect(
        service.createSubmission(dto, userId),
      ).rejects.toThrow('Database error');
    });
  });
});
