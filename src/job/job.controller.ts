import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JobService } from './job.service';
import { CreateJobDto } from './dto/createJob.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JobAggregationService } from './aggregatoion/job-aggregation.service';
import { ApplyJobDto } from './dto/apply-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobAggregationService: JobAggregationService,
  ) {}

  /**
   * ============================================================
   * Sync External Jobs
   * ============================================================
   *
   * Fetches jobs from configured external providers
   * and synchronizes them with the HireCoder database.
   *
   * This endpoint is currently used for testing.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Synchronize external jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'External jobs synchronized successfully.',
  })
  @Post('admin/sync-external')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  syncExternalJobs() {
    return this.jobAggregationService.syncExternalJobs();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new job for a company',
  })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the company owner can create jobs.',
  })
  @Post('companies/:companyId/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  createJob(
    @CurrentUser() user,
    @Param('companyId') companyId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobService.createJob(user.id, companyId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all jobs created by the authenticated recruiter',
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully.',
  })
  @Get('my/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getMyJobs(@CurrentUser() user, @Query() paginationDto: PaginationDto) {
    return this.jobService.getMyJobs(user.id, paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a specific job owned by the authenticated recruiter',
  })
  @ApiResponse({
    status: 200,
    description: 'Job retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Get('my/jobs/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getMyJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.getMyJob(user.id, jobId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Patch('my/jobs/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  updateJob(
    @CurrentUser() user,
    @Param('jobId') jobId: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobService.updateJob(user.id, jobId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Delete('my/jobs/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  deleteJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.deleteJob(user.id, jobId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Activate or deactivate a job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Patch('jobs/:jobId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  updateJobStatus(
    @CurrentUser() user,
    @Param('jobId') jobId: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobService.updateJobStatus(user.id, jobId, dto);
  }

  @ApiOperation({
    summary: 'Get all active jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully.',
  })
  @Get()
  getJobs(@Query() filterJobDto: FilterJobDto) {
    return this.jobService.getJobs(filterJobDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save a job',
  })
  @ApiResponse({
    status: 201,
    description: 'Job saved successfully.',
  })
  @Post(':jobId/save')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  saveJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.saveJob(user.id, jobId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a saved job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job removed from saved jobs.',
  })
  @Delete(':jobId/save')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  unsaveJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.unsaveJob(user.id, jobId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get saved jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved jobs retrieved successfully.',
  })
  @Get('saved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  getSavedJobs(@CurrentUser() user) {
    return this.jobService.getSavedJobs(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check whether a job is saved',
  })
  @Get('jobId/saved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  isJobSaved(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.isJobSaved(user.id, jobId);
  }

  @ApiOperation({
    summary: 'Get job details',
  })
  @ApiResponse({
    status: 200,
    description: 'Job retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @Get(':jobId')
  getJob(@Param('jobId') jobId: string) {
    return this.jobService.getJob(jobId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply for a job',
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Already applied or invalid application.',
  })
  @Post(':jobId/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  applyToJob(
    @CurrentUser() user,
    @Param('jobId') jobId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.jobService.applyToJob(user.id, jobId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check whether the candidate has applied',
  })
  @ApiResponse({
    status: 200,
    description: 'Application status retrieved.',
  })
  @Get(':jobId/application')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  getMyApplication(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.jobService.getMyApplication(user.id, jobId);
  }
}
