import type { InterviewTemplateKey } from "./types";

/**
 * Maps free-text role + vacancy context to a generic question bank.
 * Heuristic only — tuned for Spanish/English role titles common in IT consulting.
 */
export function resolveInterviewTemplateKey(args: {
  candidateRole: string;
  vacancyTitle: string;
  vacancySkillsLine?: string | null;
}): InterviewTemplateKey {
  const text =
    `${args.candidateRole} ${args.vacancyTitle} ${args.vacancySkillsLine ?? ""}`.toLowerCase();

  const has = (re: RegExp) => re.test(text);

  if (/\bsap\b|abap|fico|s\/4hana|successfactors|bw\/4|basis\b/i.test(text)) {
    return "sap";
  }
  if (
    /\bqa\b|quality assurance|pruebas|testing manual|cypress|selenium|istqb/i.test(
      text,
    )
  ) {
    return "qa";
  }
  if (
    /\bdevops\b|sre\b|kubernetes|terraform|aws|azure|gcp|cloud engineer|ci\/cd|docker/i.test(
      text,
    )
  ) {
    return "devops";
  }
  if (
    /\bdata engineer|ingeniero de datos|etl|spark|airflow|data warehouse|big data/i.test(
      text,
    ) ||
    (/\bdata\b/.test(text) &&
      /\banalyst|analista|bi\b|power bi|tableau|sql/i.test(text))
  ) {
    return "data";
  }
  if (
    /\bfrontend|front-end|react|angular|vue|next\.js|typescript.*ui|css\b/i.test(
      text,
    )
  ) {
    return "frontend-developer";
  }
  if (
    /\bbackend|back-end|api rest|microservicio|node\.js|java|spring|\.net|go\b|python.*api/i.test(
      text,
    )
  ) {
    return "backend-developer";
  }
  if (
    /\bpm\b|project manager|product owner|scrum master|gestión de proyecto|delivery manager/i.test(
      text,
    )
  ) {
    return "project-manager";
  }

  if (has(/\bdeveloper\b/) || has(/\bengineer\b/) || has(/\bprogramador\b/)) {
    if (has(/front|ui|ux/)) return "frontend-developer";
    if (has(/back|api|server/)) return "backend-developer";
    return "backend-developer";
  }

  return "general";
}
