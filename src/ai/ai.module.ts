import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [AiController],
  providers: [AiService, PrismaService],
  imports: [StorageModule],
})
export class AiModule {}
