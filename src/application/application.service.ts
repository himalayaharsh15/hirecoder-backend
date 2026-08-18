import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';
import { ApplicationStatus } from '@prisma/client';
import { JobOwnerService } from 'src/job/job-owner.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobOwnerService: JobOwnerService,
  ) {}

  private async getActiveJobOrThrow(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.isActive) {
      throw new BadRequestException(
        'This job is no longer accepting applications.',
      );
    }

    return job;
  }

  async ensureNotApplied(candidateId: string, jobId: string) {
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this job.');
    }
  }

  private async getRecruiterApplicationOrThrow(
    recruiterId: string,
    applicationId: string,
  ) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          company: {
            ownerId: recruiterId,
          },
        },
      },
      include: {
        candidate: {
          include: {
            profile: true,
          },
        },
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async applyToJob(userId: string, jobId: string, dto: CreateApplicationDto) {
    // ============================================================
    // 1. CHECK THAT JOB EXISTS AND IS ACTIVE
    // ============================================================

    const job = await this.getActiveJobOrThrow(jobId);

    // ============================================================
    // 2. CHECK EXISTING APPLICATION
    // ============================================================

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId: job.id,
        },
      },
    });

    // ============================================================
    // 3. HANDLE EXISTING APPLICATION
    // ============================================================

    if (existingApplication) {
      // ----------------------------------------------------------
      // WITHDRAWN APPLICATION
      //
      // Candidate is allowed to apply again.
      // We reuse the same application record because
      // candidateId + jobId is unique in Prisma.
      // ----------------------------------------------------------

      if (existingApplication.status === ApplicationStatus.WITHDRAWN) {
        const application = await this.prisma.application.update({
          where: {
            id: existingApplication.id,
          },

          data: {
            status: ApplicationStatus.APPLIED,
            coverLetter: dto.coverLetter,
            resumeUrl: dto.resumeUrl,
          },

          include: {
            job: {
              select: {
                id: true,
                title: true,
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
          message: 'Application submitted successfully.',
          application,
        };
      }

      // ----------------------------------------------------------
      // ALL OTHER EXISTING APPLICATIONS
      // ----------------------------------------------------------

      throw new ConflictException('You have already applied to this job.');
    }

    // ============================================================
    // 4. CREATE NEW APPLICATION
    // ============================================================

    const application = await this.prisma.application.create({
      data: {
        ...dto,

        candidate: {
          connect: {
            id: userId,
          },
        },

        job: {
          connect: {
            id: jobId,
          },
        },
      },

      include: {
        job: {
          select: {
            id: true,
            title: true,

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
      message: 'Application submitted successfully.',
      application,
    };
  }

  async getMyApplications(userId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: {
          candidateId: userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              employmentType: true,
              experienceLevel: true,
              isActive: true,
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
      }),

      this.prisma.application.count({
        where: {
          candidateId: userId,
        },
      }),
    ]);

    return {
      message: 'Applications retrieved successfully',
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getOwnedApplicationOrThrow(
    candidateId: string,
    applicationId: string,
  ) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        candidateId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            experienceLevel: true,
            isActive: true,
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

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const application = await this.getOwnedApplicationOrThrow(
      userId,
      applicationId,
    );

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Application is already withdrawn.');
    }

    if (
      application.status === ApplicationStatus.REJECTED ||
      application.status === ApplicationStatus.HIRED
    ) {
      throw new BadRequestException(
        'This application can no longer be withdrawn.',
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: ApplicationStatus.WITHDRAWN,
      },
    });

    return {
      message: 'Application withdrawn successfully.',
      application: updatedApplication,
    };
  }

  async getJobApplicants(
    userId: string,
    jobId: string,
    paginationDto: PaginationDto,
  ) {
    const job = await this.jobOwnerService.getOwnedJobOrThrow(userId, jobId);

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: {
          jobId: job.id,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  headline: true,
                  experience: true,
                  skills: true,
                },
              },
              resume: {
                select: {
                  fileUrl: true,
                  fileName: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.application.count({
        where: {
          jobId: job.id,
        },
      }),
    ]);

    return {
      message: 'Applicants retrieved successfully',
      applicants: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateApplicationStatus(
    recruiterId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.getRecruiterApplicationOrThrow(
      recruiterId,
      applicationId,
    );

    // Business rules
    if (application.status === ApplicationStatus.HIRED) {
      throw new BadRequestException('Application has already been hired.');
    }

    if (application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Application has already been rejected.');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Candidate has withdrawn the application.');
    }

    const updatedApplication = await this.prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: dto.status,
      },
    });

    return {
      message: 'Application status updated successfully.',
      application: updatedApplication,
    };
  }

  async getRecruiterApplicationSummary(recruiterId: string) {
    const applications = await this.prisma.application.findMany({
      where: {
        job: {
          company: {
            ownerId: recruiterId,
          },
        },
      },
      select: {
        status: true,
      },
    });

    const totalApplicants = applications.length;

    const applied = applications.filter(
      (application) => application.status === ApplicationStatus.APPLIED,
    ).length;

    const underReview = applications.filter(
      (application) => application.status === ApplicationStatus.UNDER_REVIEW,
    ).length;

    const shortlisted = applications.filter(
      (application) => application.status === ApplicationStatus.SHORTLISTED,
    ).length;

    const interviewScheduled = applications.filter(
      (application) =>
        application.status === ApplicationStatus.INTERVIEW_SCHEDULED,
    ).length;

    const offered = applications.filter(
      (application) => application.status === ApplicationStatus.OFFERED,
    ).length;

    const rejected = applications.filter(
      (application) => application.status === ApplicationStatus.REJECTED,
    ).length;

    const hired = applications.filter(
      (application) => application.status === ApplicationStatus.HIRED,
    ).length;

    const withdrawn = applications.filter(
      (application) => application.status === ApplicationStatus.WITHDRAWN,
    ).length;

    return {
      totalApplicants,

      shortlisted,

      interviews: interviewScheduled,

      hired,

      pipeline: {
        applied,
        underReview,
        shortlisted,
        interviewScheduled,
        offered,
        rejected,
        hired,
        withdrawn,
      },
    };
  }

  async getRecentRecruiterApplications(recruiterId: string) {
    const applications = await this.prisma.application.findMany({
      where: {
        job: {
          company: {
            ownerId: recruiterId,
          },
        },
      },

      take: 5,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        candidate: {
          select: {
            id: true,
            name: true,
            email: true,

            profile: {
              select: {
                headline: true,
                experience: true,
                skills: true,
              },
            },
            resume: {
              select: {
                fileUrl: true,
                fileName: true,
              },
            },
          },
        },

        job: {
          select: {
            id: true,
            title: true,

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
      applications,
    };
  }
}
