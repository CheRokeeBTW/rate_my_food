import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

describe('ModerationService', () => {
  let service: ModerationService;

  const prismaServiceMock = {
    postSubmission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    post: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const cloudinaryServiceMock = {
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    prismaServiceMock.$transaction.mockImplementation(
      (callback: (tx: typeof prismaServiceMock) => unknown) =>
        callback(prismaServiceMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingSubmissions', () => {
    it('should return pending submissions with author information', async () => {
      const submissions = [
        {
          id: 'submission-1',
          title: 'Pizza',
          status: 'PENDING',
          author: {
            id: 'user-1',
            username: 'testuser',
          },
        },
      ];

      prismaServiceMock.postSubmission.findMany.mockResolvedValue(
        submissions,
      );

      const result = await service.getPendingSubmissions();

      expect(
        prismaServiceMock.postSubmission.findMany,
      ).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      expect(result).toEqual(submissions);
    });
  });

  describe('approveSubmission', () => {
    const submission = {
      id: 'submission-1',
      title: 'Pizza',
      tags: ['italian'],
      imageUrl: 'https://example.com/pizza.jpg',
      publicId: 'rate-my-food/pizza123',
      authorId: 'user-1',
      status: 'PENDING',
    };

    it('should create a post and mark the submission as approved', async () => {
      const post = {
        id: 'post-1',
        title: submission.title,
        tags: submission.tags,
        imageUrl: submission.imageUrl,
        authorId: submission.authorId,
      };

      prismaServiceMock.postSubmission.findUnique.mockResolvedValue(
        submission,
      );
      prismaServiceMock.post.create.mockResolvedValue(post);
      prismaServiceMock.postSubmission.update.mockResolvedValue({
        ...submission,
        status: 'APPROVED',
      });

      const result = await service.approveSubmission(submission.id);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1);

      expect(
        prismaServiceMock.postSubmission.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: submission.id,
        },
      });

      expect(prismaServiceMock.post.create).toHaveBeenCalledWith({
        data: {
          title: submission.title,
          tags: submission.tags,
          imageUrl: submission.imageUrl,
          authorId: submission.authorId,
        },
      });

      expect(
        prismaServiceMock.postSubmission.update,
      ).toHaveBeenCalledWith({
        where: {
          id: submission.id,
        },
        data: {
          status: 'APPROVED',
        },
      });

      expect(result).toEqual(post);
      expect(cloudinaryServiceMock.deleteImage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the submission does not exist', async () => {
      prismaServiceMock.postSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.approveSubmission('missing-id'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaServiceMock.post.create).not.toHaveBeenCalled();
      expect(
        prismaServiceMock.postSubmission.update,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if the submission was already reviewed', async () => {
      prismaServiceMock.postSubmission.findUnique.mockResolvedValue({
        ...submission,
        status: 'APPROVED',
      });

      await expect(
        service.approveSubmission(submission.id),
      ).rejects.toThrow(BadRequestException);

      expect(prismaServiceMock.post.create).not.toHaveBeenCalled();
      expect(
        prismaServiceMock.postSubmission.update,
      ).not.toHaveBeenCalled();
    });
  });

  describe('rejectSubmission', () => {
    const submission = {
      id: 'submission-2',
      title: 'Burger',
      tags: ['fast-food'],
      imageUrl: 'https://example.com/burger.jpg',
      publicId: 'rate-my-food/burger123',
      authorId: 'user-2',
      status: 'PENDING',
    };

    it('should delete the Cloudinary image and mark the submission as rejected', async () => {
      const rejectedSubmission = {
        ...submission,
        status: 'REJECTED',
      };

      prismaServiceMock.postSubmission.findUnique.mockResolvedValue(
        submission,
      );
      cloudinaryServiceMock.deleteImage.mockResolvedValue(undefined);
      prismaServiceMock.postSubmission.update.mockResolvedValue(
        rejectedSubmission,
      );

      const result = await service.rejectSubmission(submission.id);

      expect(
        prismaServiceMock.postSubmission.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: submission.id,
        },
      });

      expect(
        cloudinaryServiceMock.deleteImage,
      ).toHaveBeenCalledWith(submission.publicId);

      expect(
        prismaServiceMock.postSubmission.update,
      ).toHaveBeenCalledWith({
        where: {
          id: submission.id,
        },
        data: {
          status: 'REJECTED',
        },
      });

      expect(result).toEqual(rejectedSubmission);
    });

    it('should throw NotFoundException if the submission does not exist', async () => {
      prismaServiceMock.postSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectSubmission('missing-id'),
      ).rejects.toThrow(NotFoundException);

      expect(cloudinaryServiceMock.deleteImage).not.toHaveBeenCalled();
      expect(
        prismaServiceMock.postSubmission.update,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if the submission was already reviewed', async () => {
      prismaServiceMock.postSubmission.findUnique.mockResolvedValue({
        ...submission,
        status: 'REJECTED',
      });

      await expect(
        service.rejectSubmission(submission.id),
      ).rejects.toThrow(BadRequestException);

      expect(cloudinaryServiceMock.deleteImage).not.toHaveBeenCalled();
      expect(
        prismaServiceMock.postSubmission.update,
      ).not.toHaveBeenCalled();
    });
  });
});
