import { Test, TestingModule } from '@nestjs/testing';

import { JobService } from './job.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobOwnerService } from './job-owner.service';

describe('JobService', () => {
  let service: JobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,

        {
          provide: PrismaService,
          useValue: {
            company: {
              findUnique: jest.fn(),
            },

            job: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },

            savedJob: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },

            application: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },

            resume: {
              findUnique: jest.fn(),
            },
          },
        },

        {
          provide: JobOwnerService,
          useValue: {
            getOwnedJobOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
