import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationService } from './application.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobOwnerService } from 'src/job/job-owner.service';

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: {
            job: {
              findUnique: jest.fn(),
            },
            application: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
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

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
