import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewResumeDTO {
  @ApiProperty({
    example:
      'Experienced React Developer with 5 years of experience in React, TypeScript, Next.js, Redux Toolkit and Node.js...',
    description: 'Resume content as plain text',
  })
  @IsNotEmpty()
  @IsString()
  resume!: string;
}
