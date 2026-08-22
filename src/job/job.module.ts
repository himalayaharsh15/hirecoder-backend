import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobOwnerService } from './job-owner.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobAggregationService } from './aggregatoion/job-aggregation.service';
import { GreenhouseProvider } from './aggregatoion/provider/greenhouse.provider';
import { AdzunaProvider } from './aggregatoion/provider/adzuna.provider';

@Module({
  imports: [PrismaModule],
  controllers: [JobController],
  providers: [
    JobService,
    JobOwnerService,
    JobAggregationService,
    GreenhouseProvider,
    AdzunaProvider,
  ],
  exports: [JobOwnerService],
})
export class JobModule {}
