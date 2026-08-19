export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  whyAsked: string;
}

export interface InterviewPrep {
  questions: InterviewQuestion[];
}
