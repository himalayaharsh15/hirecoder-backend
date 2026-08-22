import { Injectable, Logger } from '@nestjs/common';
import { EmploymentType, ExperienceLevel, JobSource } from '@prisma/client';

import {
  ExternalJob,
  ExternalJobProvider,
} from '../interface/external-job-provider.interface';

import { detectJobCategory } from '../utils/job-category.util';

/**
 * Represents the job structure returned by the Adzuna API.
 *
 * We keep this interface separate from ExternalJob because
 * Adzuna's response structure is different from HireCoder's
 * internal job structure.
 */
interface AdzunaJob {
  id: string | number;

  title: string;

  description?: string;

  created?: string;

  redirect_url: string;

  company?: {
    display_name?: string;
  };

  location?: {
    display_name?: string;
  };

  salary_min?: number;

  salary_max?: number;

  contract_time?: string;

  contract_type?: string;

  /**
   * Adzuna provides its own job category information.
   * We can use this later to improve our category detection.
   */
  category?: {
    label?: string;
    tag?: string;
  };
}

/**
 * Top-level response returned by the Adzuna search API.
 */
interface AdzunaResponse {
  results: AdzunaJob[];

  count?: number;
}

/**
 * Adzuna provider.
 *
 * Responsible only for:
 *
 * 1. Calling the Adzuna API
 * 2. Fetching external jobs
 * 3. Converting Adzuna jobs into HireCoder's ExternalJob format
 *
 * Job persistence is handled separately by JobAggregationService.
 */
@Injectable()
export class AdzunaProvider implements ExternalJobProvider {
  /**
   * Identifies all jobs coming from Adzuna.
   *
   * This value is also used by JobAggregationService
   * when creating/updating jobs in the database.
   */
  readonly source = JobSource.ADZUNA;

  private readonly logger = new Logger(AdzunaProvider.name);

  /**
   * Base URL for Adzuna's job search API.
   *
   * Country code "in" is added when performing the actual request
   * because HireCoder is currently targeting jobs in India.
   */
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  /**
   * Fetch jobs from Adzuna.
   *
   * We currently use a small set of targeted searches rather than
   * trying to download the entire Adzuna job database.
   *
   * The returned jobs are later normalized and synchronized
   * by JobAggregationService.
   */
  async fetchJobs(): Promise<ExternalJob[]> {
    const appId = process.env.ADZUNA_APP_ID;

    const appKey = process.env.ADZUNA_APP_KEY;

    /**
     * Fail gracefully when Adzuna credentials are not configured.
     *
     * This is useful during local development and also prevents
     * the complete job synchronization process from crashing
     * because one provider is unavailable.
     */
    if (!appId || !appKey) {
      this.logger.warn('ADZUNA_APP_ID or ADZUNA_APP_KEY is not configured.');

      return [];
    }

    /**
     * Initial search keywords.
     *
     * We intentionally keep these focused for the first version.
     * Later we can expand these searches or use Adzuna's category
     * filters more extensively.
     */
    const searches = [
      'software engineer',
      'data analyst',
      'sales executive',
      'business development',
      'digital marketing',
    ];

    /**
     * Run all searches concurrently.
     *
     * Promise.allSettled is used instead of Promise.all so that
     * one failed search does not prevent the remaining searches
     * from returning jobs.
     */
    const results = await Promise.allSettled(
      searches.map((query) => this.searchJobs(query, appId, appKey)),
    );

    const jobs: ExternalJob[] = [];

    /**
     * Process the result of each search independently.
     */
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        jobs.push(...result.value);

        return;
      }

      this.logger.error(
        `Failed to fetch Adzuna jobs for "${searches[index]}"`,
        result.reason,
      );
    });

    return jobs;
  }

  /**
   * Execute a single Adzuna search request.
   *
   * This method is kept separate from fetchJobs() so that
   * the API request logic remains isolated and reusable.
   */
  private async searchJobs(
    query: string,
    appId: string,
    appKey: string,
  ): Promise<ExternalJob[]> {
    /**
     * Adzuna's India search endpoint.
     *
     * /in/ represents India.
     * /search/1 represents page 1.
     */
    const url = new URL(`${this.baseUrl}/in/search/1`);

    /**
     * Authentication credentials.
     */
    url.searchParams.set('app_id', appId);

    url.searchParams.set('app_key', appKey);

    /**
     * Limit the number of jobs returned by each search.
     *
     * We can introduce pagination later when we need
     * a larger job inventory.
     */
    url.searchParams.set('results_per_page', '20');

    /**
     * Search keyword.
     *
     * Examples:
     *
     * software engineer
     * data analyst
     * sales executive
     */
    url.searchParams.set('what', query);

    /**
     * Request JSON response.
     */
    url.searchParams.set('content-type', 'application/json');

    const response = await fetch(url);

    /**
     * Convert non-2xx responses into errors so that
     * Promise.allSettled() can handle the failed search.
     */
    if (!response.ok) {
      throw new Error(
        `Adzuna request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as AdzunaResponse;

    this.logger.log(
      `Adzuna "${query}" returned ${data.results?.length ?? 0} jobs`,
    );

    /**
     * Convert every Adzuna job into HireCoder's
     * common ExternalJob structure.
     */
    return (data.results ?? []).map((job) => this.normalizeJob(job));
  }

  /**
   * Normalize an Adzuna job into HireCoder's
   * common ExternalJob structure.
   *
   * This is important because every provider can have
   * a completely different API response format.
   */
  private normalizeJob(job: AdzunaJob): ExternalJob {
    const description =
      job.description?.trim() || 'Job description not available.';

    const companyName = job.company?.display_name || 'Unknown Company';

    return {
      /**
       * Adzuna's job ID becomes our external identifier.
       *
       * Combined with source = ADZUNA, this allows us to
       * uniquely identify the job in our database.
       */
      sourceJobId: String(job.id),

      source: JobSource.ADZUNA,

      /**
       * Reuse the common category utility so that
       * Greenhouse and Adzuna jobs follow the same
       * classification rules.
       */
      category: detectJobCategory(job.title, description),

      title: job.title,

      description,

      companyName,

      location: job.location?.display_name,

      /**
       * Convert Adzuna's contract information into
       * HireCoder's EmploymentType enum.
       */
      employmentType: this.detectEmploymentType(
        job.contract_time,
        job.contract_type,
        job.title,
        description,
      ),

      /**
       * Adzuna does not directly use our
       * ExperienceLevel enum, so we detect it from
       * the job title and description.
       */
      experienceLevel: this.detectExperienceLevel(job.title, description),

      salaryMin: job.salary_min,

      salaryMax: job.salary_max,

      /**
       * HireCoder currently stores INR for these
       * India-focused Adzuna searches.
       */
      currency: 'INR',

      /**
       * Adzuna redirects the user to the original
       * job listing. We use the same URL for both
       * sourceUrl and applyUrl.
       */
      sourceUrl: job.redirect_url,

      applyUrl: job.redirect_url,

      /**
       * Adzuna's created date represents when the
       * external job was created/published.
       */
      postedAt: job.created ? new Date(job.created) : undefined,
    };
  }

  /**
   * Convert Adzuna contract information into
   * HireCoder's EmploymentType enum.
   *
   * We use both Adzuna's structured fields and
   * text matching as a fallback.
   */
  private detectEmploymentType(
    contractTime: string | undefined,
    contractType: string | undefined,
    title: string,
    description: string,
  ): EmploymentType {
    const text = `${title} ${description}`.toLowerCase();

    if (
      contractTime === 'part_time' ||
      text.includes('part-time') ||
      text.includes('part time')
    ) {
      return EmploymentType.PART_TIME;
    }

    if (contractType === 'contract' || text.includes('contract')) {
      return EmploymentType.CONTRACT;
    }

    if (text.includes('internship') || text.includes('intern ')) {
      return EmploymentType.INTERN;
    }

    if (text.includes('freelance') || text.includes('freelancer')) {
      return EmploymentType.FREELANCE;
    }

    /**
     * Most jobs without a specific employment type
     * are treated as full-time.
     */
    return EmploymentType.FULL_TIME;
  }

  /**
   * Detect the experience level from the job title
   * and description.
   *
   * This follows the same strategy used by
   * GreenhouseProvider so that jobs from different
   * providers behave consistently.
   */
  private detectExperienceLevel(
    title: string,
    description: string,
  ): ExperienceLevel {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes('intern') ||
      text.includes('fresher') ||
      text.includes('entry level') ||
      text.includes('entry-level')
    ) {
      return ExperienceLevel.FRESHER;
    }

    if (text.includes('junior') || text.includes('jr.')) {
      return ExperienceLevel.JUNIOR;
    }

    if (
      text.includes('lead') ||
      text.includes('principal') ||
      text.includes('staff')
    ) {
      return ExperienceLevel.LEAD;
    }

    if (text.includes('senior') || text.includes('sr.')) {
      return ExperienceLevel.SENIOR;
    }

    /**
     * If no explicit level is detected,
     * we treat the position as mid-level.
     */
    return ExperienceLevel.MID;
  }
}
