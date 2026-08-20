export interface CandidateDashboardStats {
  applications: number;
  interviews: number;
  shortlisted: number;
  savedJobs: number;
}

export interface CandidateDashboardApplication {
  id: string;
  status: string;
  createdAt: Date;

  job: {
    id: string;
    title: string;
    companyName: string | null;
  };
}

export interface CandidateDashboardJob {
  id: string;
  title: string;
  companyName: string | null;
  location: string | null;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

export interface CandidateDashboardResponse {
  stats: CandidateDashboardStats;

  profileCompletion: number;

  recentApplications: CandidateDashboardApplication[];

  recommendedJobs: CandidateDashboardJob[];
}
