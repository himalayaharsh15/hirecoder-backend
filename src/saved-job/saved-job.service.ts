import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedJobService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new BadRequestException('This job is no longer available.');
    }

    return job;
  }
  private async ensureNotSaved(candidateId: string, jobId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (savedJob) {
      throw new ConflictException('Job is already saved.');
    }
  }
  private async getSavedJobOrThrow(candidateId: string, jobId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (!savedJob) {
      throw new NotFoundException('Saved job not found.');
    }

    return savedJob;
  }

  async saveJob(candidateId: string, jobId: string) {
    const job = await this.getActiveJobOrThrow(jobId);

    await this.ensureNotSaved(candidateId, job.id);

    const savedJob = await this.prisma.savedJob.create({
      data: {
        candidate: {
          connect: {
            id: candidateId,
          },
        },
        job: {
          connect: {
            id: job.id,
          },
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            experienceLevel: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
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
      message: 'Job saved successfully.',
      savedJob,
    };
  }

  async removeSavedJob(candidateId: string, jobId: string) {
    const savedJob = await this.getSavedJobOrThrow(candidateId, jobId);

    await this.prisma.savedJob.delete({
      where: {
        id: savedJob.id,
      },
    });

    return {
      message: 'Job removed from saved jobs successfully.',
    };
  }

  async getMySavedJobs(candidateId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
      this.prisma.savedJob.findMany({
        where: {
          candidateId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,

          job: {
            select: {
              id: true,
              title: true,
              location: true,
              employmentType: true,
              experienceLevel: true,
              salaryMin: true,
              salaryMax: true,
              currency: true,
              isActive: true,

              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
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
      }),

      this.prisma.savedJob.count({
        where: {
          candidateId,
        },
      }),
    ]);

    return {
      message: 'Saved jobs retrieved successfully.',
      savedJobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
