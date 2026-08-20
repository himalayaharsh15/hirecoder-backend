import { Test, TestingModule } from '@nestjs/testing';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            reviewResume: jest.fn(),
            listModels: jest.fn(),
            analyzeJobMatch: jest.fn(),
            uploadResume: jest.fn(),
            reviewMyResume: jest.fn(),
            analyzeMyJobMatch: jest.fn(),
            generateMyInterviewPrep: jest.fn(),
            evaluateMyInterviewAnswer: jest.fn(),
            transcribeInterviewAudio: jest.fn(),
            generateMyCoverLetter: jest.fn(),
            getMyResume: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
