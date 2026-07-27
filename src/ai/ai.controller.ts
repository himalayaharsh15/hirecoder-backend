import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ReviewResumeDTO } from './DTO/review-resume.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('resume-review')
  reviewResume(@Body() reviewResumeDto: ReviewResumeDTO) {
    return this.aiService.reviewResume(reviewResumeDto.resume);
  }
  @Get('models')
  listModels() {
    return this.aiService.listModels();
  }
}
