import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/upsert-profile.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * ============================================================
 * Profile Controller
 * ============================================================
 */
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * ============================================================
   * Create / Update Profile
   * ============================================================
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update the authenticated user profile',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile saved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  createProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProfileDto,
  ) {
    return this.profileService.createOrUpdateProfile(user.id, dto);
  }

  /**
   * ============================================================
   * Get My Profile
   * ============================================================
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: { id: string }) {
    return this.profileService.getMyProfile(user.id);
  }

  /**
   * ============================================================
   * Get Public Profile
   * ============================================================
   */
  @ApiOperation({
    summary: 'Get a public profile by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }
}
