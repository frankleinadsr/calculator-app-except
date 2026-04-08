export type ProblemType = "calculator" | "text" | "image";

export interface ProblemEntry {
  id: string;
  type: ProblemType;
  input: string;
  answer: string;
  steps: string[];
  learnIt: string;
  createdAt: string;
}

export interface SolveTextResponse {
  answer: string;
  steps: string[];
  learnIt: string;
  mathConcepts: string[];
}

export interface SolveImageResponse {
  answer: string;
  steps: string[];
  learnIt: string;
  mathConcepts: string[];
  detectedProblem: string;
}

export interface CalculateResponse {
  result: number | string;
  formattedExpression: string;
}
