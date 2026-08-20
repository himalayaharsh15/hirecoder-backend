import { Test, TestingModule } from '@nestjs/testing';

import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,

        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },

        {
          provide: PrismaService,
          useValue: {
            resume: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            job: {
              findUnique: jest.fn(),
            },
          },
        },

        {
          provide: StorageService,
          useValue: {
            uploadResume: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
