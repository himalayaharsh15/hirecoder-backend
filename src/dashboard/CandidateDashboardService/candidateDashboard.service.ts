import { Injectable } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CandidateDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ============================================================
   * Candidate Dashboard
   * ============================================================
   *
   * Returns dashboard statistics for the authenticated candidate.
   *
   * Includes:
   * - Total Applications
   * - Saved Jobs
   * - Applications grouped by status
   */
  async getDashboard(candidateId: string) {
    // Common filters reused across multiple Prisma queries
    const applicationWhere: Prisma.ApplicationWhereInput = {
      candidateId,
    };

    const savedJobWhere: Prisma.SavedJobWhereInput = {
      candidateId,
    };

    // Execute independent queries in parallel
    const [applicationStats, savedJobs] = await Promise.all([
      this.prisma.application.groupBy({
        by: ['status'],
        where: applicationWhere,
        _count: {
          status: true,
        },
      }),

      this.prisma.savedJob.count({
        where: savedJobWhere,
      }),
    ]);

    // Calculate total applications
    const totalApplications = applicationStats.reduce(
      (sum, item) => sum + item._count.status,
      0,
    );

    // Initialize all statuses with 0 so frontend
    // always receives a consistent response.
    const applications: Record<ApplicationStatus, number> = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      HIRED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
      INTERVIEW_SCHEDULED: 0,
      OFFERED: 0,
    };

    // Populate application counts returned by Prisma groupBy()
    applicationStats.forEach((item) => {
      applications[item.status] = item._count.status;
    });

    const recentApplications = await this.prisma.application.findMany({
      where: {
        candidateId,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Candidate dashboard retrieved successfully.',
      dashboard: {
        totalApplications,
        savedJobs,
        applications,
        recentApplications,
      },
    };
  }
}
