import { Controller, Get, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CandidateService } from './candidate.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Candidate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  // ============================================================
  // Candidate Dashboard
  // ============================================================

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get candidate dashboard',
    description:
      'Returns candidate statistics, profile completion and recent applications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Candidate dashboard retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  getDashboard(@CurrentUser() user: any) {
    return this.candidateService.getDashboard(user.id);
  }
}
