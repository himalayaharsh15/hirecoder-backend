import { Test, TestingModule } from '@nestjs/testing';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            createCompany: jest.fn(),
            getCompanies: jest.fn(),
            getCompany: jest.fn(),
            getCompanyJobs: jest.fn(),
            getMyCompany: jest.fn(),
            updateCompany: jest.fn(),
            deleteCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
