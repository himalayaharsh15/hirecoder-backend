import {
  Controller,
  Delete,
  Get,
  Param,
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

import { SavedJobService } from './saved-job.service';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@ApiTags('Saved Jobs')
@Controller('saved-job')
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  /**
   * Save Job
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save a job',
  })
  @ApiResponse({
    status: 201,
    description: 'Job saved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Job is already saved.',
  })
  @Post('/jobs/:jobId/save')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  saveJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.savedJobService.saveJob(user.id, jobId);
  }

  /**
   * Remove Saved Job
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a saved job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job removed from saved jobs successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Saved job not found.',
  })
  @Delete('/jobs/:jobId/save')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  removeSavedJob(@CurrentUser() user, @Param('jobId') jobId: string) {
    return this.savedJobService.removeSavedJob(user.id, jobId);
  }

  /**
   * Get My Saved Jobs
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all saved jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved jobs retrieved successfully.',
  })
  @Get('/my/saved-jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  getMySavedJobs(@CurrentUser() user, @Query() paginationDto: PaginationDto) {
    return this.savedJobService.getMySavedJobs(user.id, paginationDto);
  }
}
