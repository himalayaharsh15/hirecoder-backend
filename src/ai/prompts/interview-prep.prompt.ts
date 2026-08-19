export const interviewPrepPrompt = (resume: string, jobDescription: string) => `
You are a senior technical interviewer.

Generate interview questions for a candidate based ONLY on
the candidate's resume and the provided job description.

The goal is to help the candidate prepare for a realistic
technical interview for this specific job.

Return ONLY valid JSON.

The JSON must follow this exact structure:

{
  "questions": [
    {
      "question": "",
      "category": "",
      "difficulty": "",
      "whyAsked": ""
    }
  ]
}

Rules:

- Generate 10 interview questions.
- Questions must be relevant to the specific job.
- Questions should be based on technologies, responsibilities,
  and experience demonstrated in the resume and job description.
- Do not invent technologies or experience that are not present
  in either input.
- Include a mixture of:
  - Technical concepts
  - Practical implementation
  - Problem solving
  - Architecture/design
  - Experience-based questions
- category must be one of:
  "Technical",
  "Practical",
  "Architecture",
  "Problem Solving",
  "Experience"
- difficulty must be one of:
  "Easy",
  "Medium",
  "Hard"
- whyAsked should briefly explain why this question is relevant
  to this candidate and this job.
- Prefer questions that an interviewer could realistically ask
  during a technical interview.
- Do not provide answers.
- Do not provide explanations outside the JSON.
- Return ONLY JSON.

CANDIDATE RESUME:

${resume}

JOB DESCRIPTION:

${jobDescription}
`;
