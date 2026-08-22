import { EmploymentType, ExperienceLevel, JobCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';

export class FilterJobDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'React',
    description: 'Search jobs by title or company name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'Bangalore',
    description: 'Filter jobs by location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    enum: JobCategory,
    example: JobCategory.DATA,
    description: 'Filter jobs by category',
  })
  @IsOptional()
  @IsEnum(JobCategory)
  category?: JobCategory;

  @ApiPropertyOptional({
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
    description: 'Filter by employment type',
  })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    enum: ExperienceLevel,
    example: ExperienceLevel.JUNIOR,
    description: 'Filter by experience level',
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    enum: ['latest', 'oldest'],
    example: 'latest',
    description: 'Sort jobs by creation date',
  })
  @IsOptional()
  @IsString()
  sort?: 'latest' | 'oldest';
}
