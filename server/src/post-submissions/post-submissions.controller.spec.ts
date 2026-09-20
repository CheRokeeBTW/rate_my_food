import { Test, TestingModule } from '@nestjs/testing';
import { PostSubmissionsController } from './post-submissions.controller';

describe('PostSubmissionsController', () => {
  let controller: PostSubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSubmissionsController],
    }).compile();

    controller = module.get<PostSubmissionsController>(PostSubmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
