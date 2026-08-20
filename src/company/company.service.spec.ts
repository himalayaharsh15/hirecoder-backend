import { Test, TestingModule } from '@nestjs/testing';

import { CompanyService } from './company.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyOwnerService } from './company-owner.service';

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,

        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },

            company: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },

            job: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },

        {
          provide: CompanyOwnerService,
          useValue: {
            getOwnedCompanyOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
