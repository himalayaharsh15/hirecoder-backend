import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * ============================================================
 * Prisma Service
 * ============================================================
 *
 * Purpose
 * -------
 * Provides a single PrismaClient instance for the entire application.
 *
 * Why?
 * ----
 * Instead of creating a new PrismaClient in every service,
 * NestJS injects this service wherever database access is required.
 *
 * Benefits
 * --------
 * ✔ Singleton database connection
 * ✔ Easy dependency injection
 * ✔ Reusable across all modules
 * ✔ Recommended by Prisma + NestJS
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Called automatically when NestJS starts.
   *
   * Opens the connection to PostgreSQL.
   */
  async onModuleInit() {
    await this.$connect();

    console.log('✅ Connected to PostgreSQL');
  }

  /**
   * Called automatically before NestJS shuts down.
   *
   * Gracefully disconnects Prisma.
   */
  async onModuleDestroy() {
    await this.$disconnect();

    console.log('🔴 Prisma disconnected');
  }
}
