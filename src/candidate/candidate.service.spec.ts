import { Test, TestingModule } from '@nestjs/testing';

import { CandidateService } from './candidate.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CandidateService', () => {
  let service: CandidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: PrismaService,
          useValue: {
            application: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            profile: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
