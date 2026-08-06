import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationDto } from './dto/paginationQuerry.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';
import { UpdateCompanyDto } from './dto/update-comapany.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Companies')
@Controller('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * ============================================================
   * Create Company
   * ============================================================
   */

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new company',
  })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Profile not found.',
  })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  createCompany(@CurrentUser() user, @Body() dto: CreateCompanyDto) {
    return this.companyService.createCompany(user.id, dto);
  }

  /**
   * ============================================================
   * Get All Companies
   * ============================================================
   */

  @ApiOperation({
    summary: 'Get all companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully.',
  })
  @Get()
  getCompanies(@Query() paginationDto: PaginationDto) {
    return this.companyService.getCompanies(paginationDto);
  }

  @ApiOperation({
    summary: 'Get company details',
  })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  @Get(':companyId')
  getCompany(@Param('companyId') companyId: string) {
    return this.companyService.getCompany(companyId);
  }

  @ApiOperation({
    summary: 'Get all active jobs for a company',
  })
  @ApiResponse({
    status: 200,
    description: 'Company jobs retrieved successfully.',
  })
  @Get(':companyId/jobs')
  getCompanyJobs(
    @Param('companyId') companyId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.companyService.getCompanyJobs(companyId, paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the authenticated recruiter company',
  })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully.',
  })
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  getMyCompany(@CurrentUser() user) {
    return this.companyService.getMyCompany(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update company information',
  })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully.',
  })
  @Patch(':companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  updateCompany(
    @CurrentUser() user,
    @Param('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(user.id, companyId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a company',
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully.',
  })
  @Delete(':companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  deleteCompany(@CurrentUser() user, @Param('companyId') companyId: string) {
    return this.companyService.deleteCompany(user.id, companyId);
  }
}
