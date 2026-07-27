export const resumeReviewPrompt = (resume: string) => `
You are a Senior Software Engineering Recruiter.

Review the following resume.

Return ONLY valid JSON.

{
  "atsScore": 0,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "interviewChance": "",
  "summary": ""
}

Resume:

${resume}
`;
