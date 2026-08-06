import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { RecruiterDashboardService } from './RecruiterDashboardService/recruiter-dashboard.service';
import { CandidateDashboardService } from './CandidateDashboardService/candidateDashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly recruiterDashboardService: RecruiterDashboardService,
    private readonly candidateDashboardService: CandidateDashboardService,
  ) {}

  /**
   * Recruiter Dashboard
   */
  @ApiOperation({
    summary: 'Get recruiter dashboard statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Recruiter dashboard retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only recruiters can access this endpoint.',
  })
  @Get('recruiter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getRecruiterDashboard(@CurrentUser() user) {
    return this.recruiterDashboardService.getRecruiterDashboard(user.id);
  }

  /**
   * Candidate Dashboard
   */
  @ApiOperation({
    summary: 'Get candidate dashboard statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Candidate dashboard retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only candidates can access this endpoint.',
  })
  @Get('candidate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  getCandidateDashboard(@CurrentUser() user) {
    return this.candidateDashboardService.getDashboard(user.id);
  }
}
