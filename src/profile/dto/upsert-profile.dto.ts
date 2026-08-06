import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ============================================================
 * Create Profile DTO
 * ============================================================
 *
 * Validates profile creation request.
 */
export class CreateProfileDto {
  @ApiPropertyOptional({
    example: 'Senior Frontend Engineer',
    description: 'Professional headline',
  })
  @IsOptional()
  @IsString()
  headline!: string;

  @ApiPropertyOptional({
    example:
      'Frontend Developer with 5+ years of experience building scalable web applications using React, TypeScript, Next.js and NestJS.',
    description: 'Short professional summary',
  })
  @IsOptional()
  @IsString()
  bio!: string;

  @ApiPropertyOptional({
    example: 'Bangalore, India',
    description: 'Current location',
  })
  @IsOptional()
  @IsString()
  location!: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Years of professional experience',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  experience!: number;

  @ApiPropertyOptional({
    example: ['React', 'TypeScript', 'Next.js', 'NestJS', 'PostgreSQL'],
    description: 'List of technical skills',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiPropertyOptional({
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @IsOptional()
  @IsUrl()
  githubUrl!: string;

  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @IsOptional()
  @IsUrl()
  linkedinUrl!: string;

  @ApiPropertyOptional({
    example: 'https://johndoe.dev',
    description: 'Portfolio website URL',
  })
  @IsOptional()
  @IsUrl()
  portfolioUrl!: string;
}
