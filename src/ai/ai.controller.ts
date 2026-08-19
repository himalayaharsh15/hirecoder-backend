import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AiService } from './ai.service';
import { ReviewResumeDTO } from './DTO/review-resume.dto';
import { AnalyzeJobMatchDTO } from './DTO/analyze-job-match.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UploadedResumeFile } from './Interface/resume.interface';
import { EvaluateInterviewAnswerDTO } from './DTO/evaluate-interview-answer.dto';
import type { UploadedAudioFile } from './Interface/audio.interface';

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

  @Post('job-match')
  @ApiOperation({
    summary: 'Analyze candidate resume against a job',
    description:
      "Analyzes how well a candidate's resume matches a specific job description.",
  })
  @ApiResponse({
    status: 200,
    description: 'Job match analysis completed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid resume or job description.',
  })
  analyzeJobMatch(@Body() analyzeJobMatchDto: AnalyzeJobMatchDTO) {
    return this.aiService.analyzeJobMatch(
      analyzeJobMatchDto.resume,
      analyzeJobMatchDto.jobDescription,
    );
  }

  @Post('resume/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Upload candidate resume',
    description:
      'Uploads a PDF resume, extracts its text, and stores the resume.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resume uploaded successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid resume file.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  uploadResume(@UploadedFile() file: any, @CurrentUser() user: any) {
    return this.aiService.uploadResume(file, user.id);
  }

  @Post('resume/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Review my uploaded resume using AI',
    description:
      "Retrieves the authenticated candidate's stored resume text and analyzes it using AI.",
  })
  @ApiResponse({
    status: 200,
    description: 'Resume reviewed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Resume has not been uploaded.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  reviewMyResume(@CurrentUser() user: any) {
    return this.aiService.reviewMyResume(user.id);
  }

  @Post('job-match/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Analyze my resume against a job',
    description:
      "Retrieves the authenticated candidate's resume and the selected job, then analyzes the match using AI.",
  })
  @ApiResponse({
    status: 200,
    description: 'Job match analysis completed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Resume has not been uploaded or job is invalid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job or resume not found.',
  })
  analyzeMyJobMatch(@Param('jobId') jobId: string, @CurrentUser() user: any) {
    return this.aiService.analyzeMyJobMatch(user.id, jobId);
  }

  @Post('interview-prep/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate interview preparation',
    description:
      "Generates interview questions based on the authenticated candidate's resume and the selected job.",
  })
  @ApiResponse({
    status: 200,
    description: 'Interview preparation generated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Resume has not been uploaded or job is invalid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  generateMyInterviewPrep(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any,
  ) {
    return this.aiService.generateMyInterviewPrep(user.id, jobId);
  }

  @Post('interview/evaluate/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Evaluate an interview answer',
    description:
      'Evaluates a candidate answer against an interview question and the selected job.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interview answer evaluated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid interview answer or job.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  evaluateInterviewAnswer(
    @Param('jobId') jobId: string,
    @Body() dto: EvaluateInterviewAnswerDTO,
    @CurrentUser() user: any,
  ) {
    return this.aiService.evaluateMyInterviewAnswer(
      user.id,
      jobId,
      dto.question,
      dto.answer,
    );
  }

  @Post('interview/transcribe')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Transcribe interview audio',
    description:
      'Uploads an interview recording and converts the spoken answer into text using AI.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audio transcribed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid audio file.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async transcribeInterviewAudio(@UploadedFile() file: UploadedAudioFile) {
    return this.aiService.transcribeInterviewAudio(file);
  }
}
