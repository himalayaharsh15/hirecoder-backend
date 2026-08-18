import { IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyJobDto {
  @ApiPropertyOptional({
    example:
      'I am very interested in this position and believe my React and TypeScript experience makes me a strong fit.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;

  @ApiPropertyOptional({
    example: 'https://your-storage.com/resume.pdf',
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
