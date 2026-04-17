/** Keys for preloaded question banks (aligned with `resolveInterviewTemplateKey`). */
export type InterviewTemplateKey =
  | "project-manager"
  | "backend-developer"
  | "frontend-developer"
  | "qa"
  | "sap"
  | "data"
  | "devops"
  | "general";

export type InterviewQuestionGroupId =
  | "technical"
  | "experience"
  | "problemSolving"
  | "communication";

export type InterviewQuestionGroup = {
  id: InterviewQuestionGroupId;
  titleEs: string;
  questions: string[];
};

export type AiInterviewSections = {
  technical: string[];
  experienceValidation: string[];
  scenario: string[];
  riskFit: string[];
};
