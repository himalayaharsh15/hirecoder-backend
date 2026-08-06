import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiPropertyOptional({
    example:
      'I have 5 years of experience in React, TypeScript, and Next.js. I believe my skills align well with this role.',
    description: 'Cover letter submitted by the candidate',
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({
    example: 'https://hirecoder.s3.amazonaws.com/resumes/john-doe.pdf',
    description: 'Public URL of the candidate resume',
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
