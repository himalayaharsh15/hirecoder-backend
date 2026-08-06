import { Test, TestingModule } from '@nestjs/testing';
import { SavedJobService } from './saved-job.service';

describe('SavedJobService', () => {
  let service: SavedJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedJobService],
    }).compile();

    service = module.get<SavedJobService>(SavedJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
