import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { RecruiterDashboardService } from './RecruiterDashboardService/recruiter-dashboard.service';
import { CandidateDashboardService } from './CandidateDashboardService/candidateDashboard.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    RecruiterDashboardService,
    CandidateDashboardService,
    PrismaService,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
