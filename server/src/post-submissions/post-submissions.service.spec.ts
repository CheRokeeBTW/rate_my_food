import { Test, TestingModule } from '@nestjs/testing';
import { PostSubmissionsService } from './post-submissions.service';

describe('PostSubmissionsService', () => {
  let service: PostSubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSubmissionsService],
    }).compile();

    service = module.get<PostSubmissionsService>(PostSubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
