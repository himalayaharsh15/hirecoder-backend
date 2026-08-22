import {
  JobSource,
  EmploymentType,
  ExperienceLevel,
  JobCategory,
} from '@prisma/client';

export interface ExternalJob {
  sourceJobId: string;

  source: JobSource;

  category: JobCategory;

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
