export const coverLetterPrompt = (
  resume: string,
  jobTitle: string,
  jobDescription: string,
  companyName: string,
) => `
You are a professional technical recruiter and career writer.

Write a professional, concise, personalized cover letter
for the candidate applying to the job below.

Use ONLY information that is supported by the candidate's
resume and the job description.

Do not invent:
- Skills
- Experience
- Companies
- Projects
- Achievements
- Certifications
- Education
- Technologies

The cover letter should:

- Be personalized to the specific role.
- Highlight the candidate's most relevant experience.
- Explain why the candidate is a good fit.
- Be professional but natural.
- Avoid generic AI-style phrases.
- Avoid excessive buzzwords.
- Be approximately 250-350 words.
- Do not include a fake name, phone number, email address,
  address, or date.
- Do not include "Dear Hiring Manager" unless a specific
  recruiter or hiring manager is not provided.
- Return ONLY the cover letter text.
- Do not return JSON.
- Do not use markdown.

COMPANY:

${companyName}

JOB TITLE:

${jobTitle}

JOB DESCRIPTION:

${jobDescription}

CANDIDATE RESUME:

${resume}
`;
