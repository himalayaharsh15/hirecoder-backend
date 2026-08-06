import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ============================================================
 * Create Company DTO
 * ============================================================
 *
 * Validates company creation request.
 */
export class CreateCompanyDto {
  @ApiProperty({
    example: 'OpenAI',
    description: 'Company name',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example:
      'OpenAI is an AI research and deployment company building safe and beneficial AI.',
    description: 'Company description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://openai.com',
    description: 'Official company website',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: 'San Francisco, California',
    description: 'Company headquarters or primary location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/company-logo.png',
    description: 'Public URL of the company logo',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
