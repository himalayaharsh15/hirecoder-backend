import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import {
  ExternalJob,
  ExternalJobProvider,
} from '../interface/external-job-provider.interface';

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at?: string;
  location?: {
    name?: string;
  };
  absolute_url: string;
  content?: string;
}

interface GreenhouseJobsResponse {
  jobs: GreenhouseJob[];
  meta?: {
    total?: number;
  };
}

interface GreenhouseBoardResponse {
  name: string;
}

@Injectable()
export class GreenhouseProvider implements ExternalJobProvider {
  readonly source = JobSource.GREENHOUSE;

  private readonly logger = new Logger(GreenhouseProvider.name);

  private readonly baseUrl = 'https://boards-api.greenhouse.io/v1/boards';

  /**
   * Fetch jobs from all configured Greenhouse organizations.
   *
   * Example:
   *
   * GREENHOUSE_BOARD_TOKENS=company-one,company-two,company-three
   */
  async fetchJobs(): Promise<ExternalJob[]> {
    const boardTokens = this.getBoardTokens();

    if (!boardTokens.length) {
      this.logger.warn('No Greenhouse board tokens configured.');

      return [];
    }

    const results = await Promise.allSettled(
      boardTokens.map((boardToken) => this.fetchBoardJobs(boardToken)),
    );

    const jobs: ExternalJob[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        jobs.push(...result.value);
        return;
      }

      this.logger.error(
        `Failed to fetch Greenhouse board: ${boardTokens[index]}`,
        result.reason,
      );
    });

    return jobs;
  }

  /**
   * Fetch jobs belonging to one Greenhouse organization.
   */
  private async fetchBoardJobs(boardToken: string): Promise<ExternalJob[]> {
    const boardUrl = `${this.baseUrl}/${encodeURIComponent(boardToken)}`;

    /**
     * The board endpoint gives us the organization's name.
     */
    const boardResponse = await fetch(boardUrl);

    if (!boardResponse.ok) {
      throw new Error(
        `Greenhouse board request failed: ${boardResponse.status}`,
      );
    }

    const board = (await boardResponse.json()) as GreenhouseBoardResponse;

    /**
     * content=true gives us the full published job description.
     */
    const jobsResponse = await fetch(`${boardUrl}/jobs?content=true`);

    if (!jobsResponse.ok) {
      throw new Error(`Greenhouse jobs request failed: ${jobsResponse.status}`);
    }

    const data = (await jobsResponse.json()) as GreenhouseJobsResponse;

    return data.jobs.map((job) => this.normalizeJob(job, board.name));
  }

  /**
   * Convert Greenhouse's response into HireCoder's
   * common ExternalJob structure.
   */
  private normalizeJob(job: GreenhouseJob, companyName: string): ExternalJob {
    const description = job.content?.trim() || 'Job description not available.';

    return {
      sourceJobId: String(job.id),

      source: JobSource.GREENHOUSE,

      title: job.title,

      description,

      companyName,

      location: job.location?.name,

      sourceUrl: job.absolute_url,

      applyUrl: job.absolute_url,

      employmentType: this.detectEmploymentType(job.title, description),

      experienceLevel: this.detectExperienceLevel(job.title, description),

      postedAt: job.updated_at ? new Date(job.updated_at) : undefined,
    };
  }

  /**
   * Read configured Greenhouse board tokens.
   */
  private getBoardTokens(): string[] {
    return (
      process.env.GREENHOUSE_BOARD_TOKENS?.split(',')
        .map((token) => token.trim())
        .filter(Boolean) ?? []
    );
  }

  private detectEmploymentType(
    title: string,
    description: string,
  ): ExternalJob['employmentType'] {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('internship') || text.includes('intern ')) {
      return 'INTERN';
    }

    if (text.includes('freelance') || text.includes('freelancer')) {
      return 'FREELANCE';
    }

    if (text.includes('part-time') || text.includes('part time')) {
      return 'PART_TIME';
    }

    if (text.includes('contract') || text.includes('contractor')) {
      return 'CONTRACT';
    }

    return 'FULL_TIME';
  }

  private detectExperienceLevel(
    title: string,
    description: string,
  ): ExternalJob['experienceLevel'] {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes('intern') ||
      text.includes('fresher') ||
      text.includes('entry level') ||
      text.includes('entry-level')
    ) {
      return 'FRESHER';
    }

    if (
      text.includes('junior') ||
      text.includes('jr.') ||
      text.includes('jr ')
    ) {
      return 'JUNIOR';
    }

    if (
      text.includes('lead') ||
      text.includes('principal') ||
      text.includes('staff')
    ) {
      return 'LEAD';
    }

    if (
      text.includes('senior') ||
      text.includes('sr.') ||
      text.includes('sr ')
    ) {
      return 'SENIOR';
    }

    return 'MID';
  }
}
