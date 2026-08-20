import { Test, TestingModule } from '@nestjs/testing';

import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobAggregationService } from './aggregatoion/job-aggregation.service';

describe('JobController', () => {
  let controller: JobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: {
            createJob: jest.fn(),
            getMyJobs: jest.fn(),
            getMyJob: jest.fn(),
            updateJob: jest.fn(),
            deleteJob: jest.fn(),
            updateJobStatus: jest.fn(),
            getJobs: jest.fn(),
            saveJob: jest.fn(),
            unsaveJob: jest.fn(),
            getSavedJobs: jest.fn(),
            isJobSaved: jest.fn(),
            getJob: jest.fn(),
            applyToJob: jest.fn(),
            getMyApplication: jest.fn(),
          },
        },
        {
          provide: JobAggregationService,
          useValue: {
            syncExternalJobs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
