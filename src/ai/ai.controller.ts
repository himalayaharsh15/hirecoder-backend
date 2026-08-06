import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AiService } from './ai.service';
import { ReviewResumeDTO } from './DTO/review-resume.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Review Resume using AI
   */
  @ApiOperation({
    summary: 'Review a resume using AI',
    description:
      'Analyzes the resume and provides feedback, strengths, weaknesses, and improvement suggestions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resume reviewed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid resume content.',
  })
  @Post('resume-review')
  reviewResume(@Body() reviewResumeDto: ReviewResumeDTO) {
    return this.aiService.reviewResume(reviewResumeDto.resume);
  }

  /**
   * List Available AI Models
   */
  @ApiOperation({
    summary: 'Get available AI models',
  })
  @ApiResponse({
    status: 200,
    description: 'Available AI models retrieved successfully.',
  })
  @Get('models')
  listModels() {
    return this.aiService.listModels();
  }
}
