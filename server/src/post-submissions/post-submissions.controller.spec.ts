import { Test, TestingModule } from '@nestjs/testing';
import { PostSubmissionsController } from './post-submissions.controller';
import { PostSubmissionsService } from './post-submissions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

describe('PostSubmissionsController', () => {
  let controller: PostSubmissionsController;

  const postSubmissionsServiceMock = {
    createSubmission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSubmissionsController],
      providers: [
        {
          provide: PostSubmissionsService,
          useValue: postSubmissionsServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<PostSubmissionsController>(
      PostSubmissionsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});