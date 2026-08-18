import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  ExternalJob,
  ExternalJobProvider,
} from './interface/external-job-provider.interface';
import { GreenhouseProvider } from './provider/greenhouse.provider';

@Injectable()
export class JobAggregationService {
  private readonly logger = new Logger(JobAggregationService.name);

  private readonly providers: ExternalJobProvider[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly greenhouseProvider: GreenhouseProvider,
  ) {
    /**
     * All external job providers are registered here.
     *
     * Later:
     *
     * [
     *   greenhouseProvider,
     *   ashbyProvider,
     *   adzunaProvider,
     * ]
     */
    this.providers = [greenhouseProvider];
  }

  /**
   * Fetch jobs from every configured external provider
   * and synchronize them with the HireCoder database.
   */
  async syncExternalJobs() {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.fetchJobs()),
    );

    let totalFetched = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      const provider = this.providers[index];

      if (result.status === 'rejected') {
        totalFailed++;

        this.logger.error(
          `Failed to sync ${provider.source} jobs`,
          result.reason,
        );

        continue;
      }

      const jobs = result.value;

      totalFetched += jobs.length;

      const syncResult = await this.syncJobs(jobs);

      totalCreated += syncResult.created;
      totalUpdated += syncResult.updated;
    }

    return {
      message: 'External jobs synchronized successfully',
      totalFetched,
      totalCreated,
      totalUpdated,
      totalFailed,
    };
  }

  /**
   * Synchronize jobs belonging to one external provider.
   */
  private async syncJobs(jobs: ExternalJob[]) {
    let created = 0;
    let updated = 0;

    for (const job of jobs) {
      const existingJob = await this.prisma.job.findUnique({
        where: {
          source_sourceJobId: {
            source: job.source,
            sourceJobId: job.sourceJobId,
          },
        },
      });

      if (existingJob) {
        await this.prisma.job.update({
          where: {
            id: existingJob.id,
          },
          data: {
            title: job.title,
            description: job.description,

            companyName: job.companyName,
            location: job.location,

            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,

            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: job.currency ?? 'INR',

            sourceUrl: job.sourceUrl,
            applyUrl: job.applyUrl,

            isActive: true,
          },
        });

        updated++;
      } else {
        await this.prisma.job.create({
          data: {
            title: job.title,
            description: job.description,

            companyName: job.companyName,
            location: job.location,

            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,

            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: job.currency ?? 'INR',

            source: job.source,
            sourceJobId: job.sourceJobId,

            sourceUrl: job.sourceUrl,
            applyUrl: job.applyUrl,

            isActive: true,
          },
        });

        created++;
      }
    }

    return {
      created,
      updated,
    };
  }
}
