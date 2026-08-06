import { Injectable } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecruiterDashboardService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * ============================================================
   * Recruiter Dashboard
   * ============================================================
   *
   * Returns dashboard statistics for the authenticated recruiter.
   *
   * Includes:
   * - Total Jobs
   * - Active / Inactive Jobs
   * - Total Applications
   * - Applications grouped by status
   */
  async getRecruiterDashboard(recruiterId: string) {
    // Common filters reused across multiple Prisma queries
    const jobWhere: Prisma.JobWhereInput = {
      company: {
        ownerId: recruiterId,
      },
    };

    const applicationWhere: Prisma.ApplicationWhereInput = {
      job: {
        company: {
          ownerId: recruiterId,
        },
      },
    };

    // Execute independent queries in parallel for better performance
    const [jobStats, applicationStats] = await Promise.all([
      this.prisma.job.groupBy({
        by: ['isActive'],
        where: jobWhere,
        _count: {
          isActive: true,
        },
      }),

      this.prisma.application.groupBy({
        by: ['status'],
        where: applicationWhere,
        _count: {
          status: true,
        },
      }),
    ]);

    // Extract active and inactive job counts
    const activeJobs =
      jobStats.find((job) => job.isActive)?._count.isActive ?? 0;

    const inactiveJobs =
      jobStats.find((job) => !job.isActive)?._count.isActive ?? 0;

    const totalJobs = activeJobs + inactiveJobs;

    // Calculate total applications from grouped results
    const totalApplications = applicationStats.reduce(
      (total, item) => total + item._count.status,
      0,
    );

    // Initialize all statuses with 0 so the frontend always
    // receives a consistent response shape.
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

    return {
      message: 'Recruiter dashboard retrieved successfully.',
      dashboard: {
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalApplications,
        applications,
      },
    };
  }
}
