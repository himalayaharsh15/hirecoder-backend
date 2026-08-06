import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * ============================================================
 * Prisma Module
 * ============================================================
 *
 * Purpose
 * -------
 * Registers PrismaService so it can be injected
 * anywhere in the application.
 *
 * Why @Global?
 * -------------
 * Since almost every feature (Auth, AI, Resume, etc.)
 * needs database access, we register it once globally.
 *
 * This avoids importing PrismaModule repeatedly
 * into every feature module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
