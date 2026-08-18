import { JobSource, EmploymentType, ExperienceLevel } from '@prisma/client';

export interface ExternalJob {
  sourceJobId: string;

  source: JobSource;

  title: string;

  description: string;

  companyName: string;

  companyLogoUrl?: string;

  location?: string;

  employmentType: EmploymentType;

  experienceLevel: ExperienceLevel;

  sourceUrl: string;

  applyUrl: string;

  salaryMin?: number;

  salaryMax?: number;

  currency?: string;

  postedAt?: Date;
}

export interface ExternalJobProvider {
  readonly source: JobSource;

  fetchJobs(): Promise<ExternalJob[]>;
}
