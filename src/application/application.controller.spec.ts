import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            applyToJob: jest.fn(),
            getMyApplications: jest.fn(),
            withdrawApplication: jest.fn(),
            getJobApplicants: jest.fn(),
            updateApplicationStatus: jest.fn(),
            getRecruiterApplicationSummary: jest.fn(),
            getRecentRecruiterApplications: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
