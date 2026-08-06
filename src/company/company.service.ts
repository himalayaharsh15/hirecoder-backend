import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationDto } from 'src/company/dto/paginationQuerry.dto';
import { CompanyOwnerService } from './company-owner.service';
import { UpdateCompanyDto } from './dto/update-comapany.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyOwnerService: CompanyOwnerService,
  ) {}

  async createCompany(userId: string, dto: CreateCompanyDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new BadRequestException(
        'Profile not found. Please create a profile first.',
      );
    }

    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        location: dto.location,
        logoUrl: dto.logoUrl,
        owner: {
          connect: { id: userId },
        },
      },
    });

    return {
      message: 'Company created successfully',
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        website: company.website,
        location: company.location,
        logoUrl: company.logoUrl,
      },
    };
  }

  async getCompanies(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          location: true,
          logoUrl: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
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
      }),
      this.prisma.company.count(),
    ]);

    return {
      message: 'Companies retrieved successfully',
      companies: companies.map(({ _count, ...company }) => ({
        ...company,
        jobsCount: _count.jobs,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        logoUrl: true,
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

    const { _count, ...companyData } = company;

    return {
      message: 'Company retrieved successfully',
      company: {
        ...companyData,
        jobsCount: _count.jobs,
      },
    };
  }

  async getCompanyJobs(companyId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: {
          companyId,
          isActive: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
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
        where: {
          companyId,
          isActive: true,
        },
      }),
    ]);

    return {
      message: 'Company jobs retrieved successfully',
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        logoUrl: true,
        createdAt: true,
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
    const { _count, ...companyData } = company;

    return {
      message: 'Company retrieved successfully',
      company: {
        ...companyData,
        jobsCount: _count.jobs,
      },
    };
  }

  async updateCompany(
    userId: string,
    companyId: string,
    dto: UpdateCompanyDto,
  ) {
    const company = await this.companyOwnerService.getOwnedCompanyOrThrow(
      userId,
      companyId,
    );
    const updatedCompany = await this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        ...dto,
      },
    });
    return {
      message: 'Company updated successfully',
      company: updatedCompany,
    };
  }

  async deleteCompany(userId: string, companyId: string) {
    const company = await this.companyOwnerService.getOwnedCompanyOrThrow(
      userId,
      companyId,
    );
    await this.prisma.company.delete({
      where: {
        id: company.id,
      },
    });
    return {
      message: 'Company deleted successfully.',
    };
  }
}
