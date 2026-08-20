import { Test, TestingModule } from '@nestjs/testing';

import { DashboardController } from './dashboard.controller';
import { RecruiterDashboardService } from './RecruiterDashboardService/recruiter-dashboard.service';
import { CandidateDashboardService } from './CandidateDashboardService/candidateDashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: RecruiterDashboardService,
          useValue: {
            getRecruiterDashboard: jest.fn(),
          },
        },
        {
          provide: CandidateDashboardService,
          useValue: {
            getDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
