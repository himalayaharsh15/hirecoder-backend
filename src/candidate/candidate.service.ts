import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CandidateDashboardResponse } from './interface/candidate-dashboard.interface';

@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<CandidateDashboardResponse> {
    // ============================================================
    // Fetch dashboard data in parallel
    // ============================================================

    const [applicationCount, profile, recentApplications] = await Promise.all([
      // ----------------------------------------------------------
      // Total applications
      // ----------------------------------------------------------

      this.prisma.application.count({
        where: {
          candidateId: userId,
        },
      }),

      // ----------------------------------------------------------
      // Candidate profile
      // ----------------------------------------------------------

      this.prisma.profile.findUnique({
        where: {
          userId,
        },
      }),

      // ----------------------------------------------------------
      // Recent applications
      // ----------------------------------------------------------

      this.prisma.application.findMany({
        where: {
          candidateId: userId,
        },

        orderBy: {
          createdAt: 'desc',
        },

        take: 5,

        select: {
          id: true,
          status: true,
          createdAt: true,

          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
            },
          },
        },
      }),
    ]);

    // ============================================================
    // Calculate profile completion
    // ============================================================

    let profileCompletion = 0;

    if (profile) {
      const fields = [
        profile.headline,
        profile.location,
        profile.experience,
        profile.skills?.length,
        profile.bio,
        profile.githubUrl,
        profile.linkedinUrl,
        profile.portfolioUrl,
      ];

      const completedFields = fields.filter(
        (field) =>
          field !== null && field !== undefined && field !== '' && field !== 0,
      ).length;

      profileCompletion = Math.round((completedFields / fields.length) * 100);
    }

    // ============================================================
    // Dashboard response
    // ============================================================

    return {
      stats: {
        applications: applicationCount,

        // We'll connect these after checking your
        // ApplicationStatus and Interview models.
        interviews: 0,
        shortlisted: 0,

        // We'll connect this after checking your
        // SavedJob model.
        savedJobs: 0,
      },

      profileCompletion,

      recentApplications,

      // Recommendation engine comes next.
      recommendedJobs: [],
    };
  }
}
