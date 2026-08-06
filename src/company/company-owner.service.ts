import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyOwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnedCompanyOrThrow(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
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
        updatedAt: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}
