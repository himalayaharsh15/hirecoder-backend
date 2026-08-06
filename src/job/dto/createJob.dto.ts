import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EmploymentType, ExperienceLevel } from '@prisma/client';

/**
 * ============================================================
 * Create Job DTO
 * ============================================================
 *
 * Validates the request body for creating a job.
 */
export class CreateJobDto {
  @ApiProperty({
    example: 'Senior React Developer',
    description: 'Job title',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example:
      'We are looking for an experienced React developer with TypeScript and Next.js knowledge.',
    description: 'Detailed job description',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    example: 'Bangalore, India',
    description: 'Job location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
    description: 'Employment type',
  })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.JUNIOR,
    description: 'Required experience level',
  })
  @IsEnum(ExperienceLevel)
  experienceLevel!: ExperienceLevel;

  @ApiPropertyOptional({
    example: 800000,
    description: 'Minimum annual salary',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({
    example: 1500000,
    description: 'Maximum annual salary',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  salaryMax?: number;

  @ApiPropertyOptional({
    example: 'INR',
    description: 'Salary currency',
    default: 'INR',
  })
  @IsOptional()
  @IsString()
  currency: string = 'INR';
}
