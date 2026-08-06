import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [PrismaModule, JobModule],
  providers: [ApplicationService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
