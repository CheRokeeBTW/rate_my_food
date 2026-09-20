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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostSubmissionsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<PostSubmissionsService>(PostSubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});