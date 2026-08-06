import { Module } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { SavedJobController } from './saved-job.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SavedJobService, PrismaService],
  controllers: [SavedJobController],
})
export class SavedJobModule {}
