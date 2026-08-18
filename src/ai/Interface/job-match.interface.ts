export interface JobMatch {
  matchScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  experienceMatch: boolean;

  interviewTopics: string[];

  recommendations: string[];

  summary: string;
}
