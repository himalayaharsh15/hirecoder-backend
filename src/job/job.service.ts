import {
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
        company: {
          connect: {
            id: companyId,
          },
        },
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
}
