import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * Apply to a Job
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply to a job',
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Job is inactive or application already exists.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Post('/jobs/:jobId/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  applyToJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationService.applyToJob(user.id, jobId, dto);
  }

  /**
   * Get My Applications
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all applications submitted by the authenticated candidate',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully.',
  })
  @Get('my/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  getMyApplications(
    @CurrentUser() user,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.applicationService.getMyApplications(user.id, paginationDto);
  }

  /**
   * Withdraw Application
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Withdraw a job application',
  })
  @ApiResponse({
    status: 200,
    description: 'Application withdrawn successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Application cannot be withdrawn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found.',
  })
  @Patch('my/applications/:applicationId/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  withdrawApplication(
    @CurrentUser() user,
    @Param('applicationId') applicationId: string,
  ) {
    return this.applicationService.withdrawApplication(user.id, applicationId);
  }

  /**
   * Get Job Applicants
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all applicants for a job',
  })
  @ApiResponse({
    status: 200,
    description: 'Applicants retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Get('/jobs/:jobId/applicants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getJobApplicants(
    @CurrentUser() user,
    @Param('jobId') jobId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.applicationService.getJobApplicants(
      user.id,
      jobId,
      paginationDto,
    );
  }

  /**
   * Update Application Status
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an application status',
  })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found.',
  })
  @Patch('/:applicationId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  updateApplicationStatus(
    @CurrentUser() user,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationService.updateApplicationStatus(
      user.id,
      applicationId,
      dto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recruiter application summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Recruiter application summary retrieved successfully.',
  })
  @Get('recruiter/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getRecruiterApplicationSummary(@CurrentUser() user) {
    return this.applicationService.getRecruiterApplicationSummary(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recent applications for recruiter',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent applications retrieved successfully.',
  })
  @Get('recruiter/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getRecentRecruiterApplications(@CurrentUser() user) {
    return this.applicationService.getRecentRecruiterApplications(user.id);
  }
}
