import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyOwnerService } from './company-owner.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyOwnerService],
  exports: [CompanyOwnerService],
})
export class CompanyModule {}
