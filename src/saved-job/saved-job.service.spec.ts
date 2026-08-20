import { Test, TestingModule } from '@nestjs/testing';

import { SavedJobService } from './saved-job.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SavedJobService', () => {
  let service: SavedJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedJobService,
        {
          provide: PrismaService,
          useValue: {
            job: {
              findUnique: jest.fn(),
            },

            savedJob: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SavedJobService>(SavedJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
