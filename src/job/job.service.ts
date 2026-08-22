import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './dto/createJob.dto';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobOwnerService } from './job-owner.service';
import { Prisma } from '@prisma/client';
import { FilterJobDto } from './dto/filter-job.dto';
import { JobAggregationService } from './aggregatoion/job-aggregation.service';
import { ApplyJobDto } from './dto/apply-job.dto';

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobOwnerService: JobOwnerService,
  ) {}

  async createJob(userId: string, companyId: string, dto: CreateJobDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to create jobs for this company',
      );
    }

    const job = await this.prisma.job.create({
      data: {
        ...dto,

        // This job was created directly on HireCoder.
        source: 'HIRECODER',

        // The authenticated recruiter owns this job.
        recruiter: {
          connect: {
            id: userId,
          },
        },

        // Keep the existing Company relationship.
        company: {
          connect: {
            id: companyId,
          },
        },

        // Store the company name directly so the unified job
        // feed can display it without depending on the Company relation.
        companyName: company.name,
      },
    });

    return {
      message: 'Job created successfully',
      job,
    };
  }

  /**
   * ============================================================
   * Find Recruiter's Job
   * ============================================================
   *
   * Returns a job only if it belongs to one of the recruiter's
   * companies.
   *
   * Throws NotFoundException if:
   * - Job doesn't exist
   * - Job belongs to another recruiter
   */
  private async getOwnedJobOrThrow(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          ownerId: userId,
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async getMyJobs(userId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: {
          recruiterId: userId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({
        where: {
          company: {
            ownerId: userId,
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / paginationDto.limit);

    return {
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        page: paginationDto.page,
        limit: paginationDto.limit,
        total,
        totalPages,
      },
    };
  }

  async getMyJob(userId: string, jobId: string) {
    const job = await this.getOwnedJobOrThrow(userId, jobId);

    return {
      message: 'Job retrieved successfully',
      job,
    };
  }

  async updateJob(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.getOwnedJobOrThrow(userId, jobId);
    const updatedJob = await this.prisma.job.update({
      where: { id: job.id },
      data: dto,
    });
    return {
      message: 'Job updated successfully',
      job: updatedJob,
    };
  }

  async deleteJob(userId: string, jobId: string) {
    const job = await this.getOwnedJobOrThrow(userId, jobId);
    await this.prisma.job.delete({
      where: { id: job.id },
    });
    return {
      message: 'Job deleted successfully',
    };
  }

  async updateJobStatus(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.getOwnedJobOrThrow(userId, jobId);
    const updatedJob = await this.prisma.job.update({
      where: { id: job.id },
      data: { isActive: dto.isActive },
    });
    return {
      message: `Job ${
        updatedJob.isActive ? 'activated' : 'deactivated'
      } successfully`,
      job: updatedJob,
    };
  }

  async getJobs(filterJobDto: FilterJobDto) {
    const {
      search,
      location,
      category,
      employmentType,
      experienceLevel,
      sort,
      limit,
      page,
    } = filterJobDto;

    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          companyName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (category) {
      where.category = category;
    }

    const orderBy: Prisma.JobOrderByWithRelationInput =
      sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          employmentType: true,
          experienceLevel: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              location: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),

      this.prisma.job.count({
        where,
      }),
    ]);

    return {
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJob(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            website: true,
            location: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job || !job.isActive) {
      throw new NotFoundException('Job not found');
    }

    return {
      message: 'Job retrieved successfully',
      job,
    };
  }
  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      message: 'Company retrieved successfully',
      ...company,
      jobsCount: company._count.jobs,
    };
  }

  async saveJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job || !job.isActive) {
      throw new NotFoundException('Job not found');
    }

    const existingSavedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
    });

    if (existingSavedJob) {
      return {
        message: 'Job already saved',
        saved: true,
      };
    }

    await this.prisma.savedJob.create({
      data: {
        candidateId: userId,
        jobId,
      },
    });

    return {
      message: 'Job saved successfully',
      saved: true,
    };
  }

  async unsaveJob(userId: string, jobId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
    });

    if (!savedJob) {
      return {
        message: 'Job is not saved',
        saved: false,
      };
    }

    await this.prisma.savedJob.delete({
      where: {
        id: savedJob.id,
      },
    });

    return {
      message: 'Job removed from saved jobs',
      saved: false,
    };
  }

  async getSavedJobs(userId: string) {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: {
        candidateId: userId,
        job: {
          isActive: true,
        },
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                location: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Saved jobs retrieved successfully',
      jobs: savedJobs.map((savedJob) => savedJob.job),
    };
  }

  async isJobSaved(userId: string, jobId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
    });

    return {
      saved: !!savedJob,
    };
  }

  async applyToJob(userId: string, jobId: string, dto: ApplyJobDto) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job || !job.isActive) {
      throw new NotFoundException('Job not found or no longer active');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    const resume = await this.prisma.resume.findUnique({
      where: {
        userId,
      },
      select: {
        fileUrl: true,
      },
    });

    const application = await this.prisma.application.create({
      data: {
        candidateId: userId,
        jobId,
        coverLetter: dto.coverLetter,
        resumeUrl: resume?.fileUrl ?? null,
      },
      include: {
        job: {
          include: {
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
      message: 'Application submitted successfully',
      application,
    };
  }

  async getMyApplication(userId: string, jobId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
      include: {
        job: {
          include: {
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
      applied: !!application,
      application,
    };
  }
}
