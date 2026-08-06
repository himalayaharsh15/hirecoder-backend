import { ApplicationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.UNDER_REVIEW,
    description: 'New status of the application',
  })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
