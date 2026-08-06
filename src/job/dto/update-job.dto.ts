import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './createJob.dto';
import { IsBoolean } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsBoolean()
  isActive?: boolean;
}
