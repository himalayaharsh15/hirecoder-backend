export const jobMatchPrompt = (resume: string, jobDescription: string) => `
You are a senior technical recruiter and interview evaluator.

Analyze how well the candidate's resume matches the job description.

Your analysis must be based ONLY on the information provided
in the resume and job description.

Return ONLY valid JSON.

The JSON must follow this exact structure:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "experienceMatch": false,
  "interviewTopics": [],
  "recommendations": [],
  "summary": ""
}

Rules:

- matchScore must be a number between 0 and 100.
- matchedSkills must contain only skills that are explicitly
  demonstrated in the resume and relevant to the job description.
- missingSkills must contain important skills mentioned in the
  job description for which there is no clear evidence in the resume.
- Do not call a skill missing if the resume demonstrates an
  equivalent or closely related technology.
- Do not assume a skill exists simply because it is common
  for the candidate's role.
- experienceMatch must be true only when the candidate's
  demonstrated experience reasonably matches the job requirements.
- interviewTopics should contain technical topics that are
  likely to be relevant to this specific job.
- recommendations should provide practical suggestions for
  improving the candidate's chances.
- Do not invent experience, skills, qualifications, or projects
  that are not present in the provided information.
- Return ONLY JSON. Do not include markdown or explanations
  outside the JSON.

CANDIDATE RESUME:

${resume}

JOB DESCRIPTION:

${jobDescription}
`;
