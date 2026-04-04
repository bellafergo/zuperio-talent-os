import type { InterviewTemplateKey } from "./types";

/**
 * Classify `text` into a template key, or null if nothing matches.
 * Order matters: leadership/PM before engineering so vacancy titles win over skill tokens like "Java".
 */
function matchInterviewTemplateFromText(text: string): InterviewTemplateKey | null {
  const t = text.toLowerCase();
  if (!t.trim()) return null;

  const has = (re: RegExp) => re.test(t);

  if (/\bsap\b|abap|fico|s\/4hana|successfactors|bw\/4|basis\b/i.test(t)) {
    return "sap";
  }
  if (
    /\bqa\b|quality assurance|pruebas|testing manual|cypress|selenium|istqb/i.test(t)
  ) {
    return "qa";
  }
  if (
    /\bdevops\b|sre\b|kubernetes|terraform|aws|azure|gcp|cloud engineer|ci\/cd|docker/i.test(
      t,
    )
  ) {
    return "devops";
  }
  if (
    /\bdata engineer|ingeniero de datos|etl|spark|airflow|data warehouse|big data/i.test(
      t,
    ) ||
    (/\bdata\b/.test(t) && /\banalyst|analista|bi\b|power bi|tableau|sql/i.test(t))
  ) {
    return "data";
  }
  if (
    /\bpm\b|project manager|program manager|product owner|scrum master|gestión de proyecto|delivery manager|jefe de proyecto/i.test(
      t,
    )
  ) {
    return "project-manager";
  }
  if (
    /\bfrontend|front-end|react|angular|vue|next\.js|typescript.*ui|css\b/i.test(t)
  ) {
    return "frontend-developer";
  }
  if (
    /\bbackend|back-end|api rest|microservicio|node\.js|java|spring|\.net|go\b|python.*api/i.test(
      t,
    )
  ) {
    return "backend-developer";
  }

  if (has(/\bdeveloper\b/) || has(/\bengineer\b/) || has(/\bprogramador\b/)) {
    if (has(/front|ui|ux/)) return "frontend-developer";
    if (has(/back|api|server/)) return "backend-developer";
    return "backend-developer";
  }

  return null;
}

/**
 * Maps free-text role + vacancy context to a generic question bank.
 * Priority: linked vacancy (title → title+summary → skills/requirements → seniority), then candidate role.
 */
export function resolveInterviewTemplateKey(args: {
  /** Fallback when there is no usable vacancy context */
  candidateRole?: string;
  vacancyTitle?: string;
  vacancySkillsLine?: string | null;
  vacancyRoleSummary?: string | null;
  vacancySeniority?: string | null;
  /** Structured requirement skill names, comma-separated */
  vacancyRequirementNames?: string | null;
}): InterviewTemplateKey {
  const candidateRole = (args.candidateRole ?? "").trim();
  const title = (args.vacancyTitle ?? "").trim();
  const summary = (args.vacancyRoleSummary ?? "").trim();
  const skills = (args.vacancySkillsLine ?? "").trim();
  const reqNames = (args.vacancyRequirementNames ?? "").trim();
  const seniority = (args.vacancySeniority ?? "").trim();

  const skillsBundle = [skills, reqNames].filter(Boolean).join(" ");

  const fromVacancy =
    matchInterviewTemplateFromText(title) ??
    matchInterviewTemplateFromText(`${title} ${summary}`) ??
    matchInterviewTemplateFromText(skillsBundle) ??
    matchInterviewTemplateFromText(`${title} ${summary} ${skillsBundle}`) ??
    matchInterviewTemplateFromText(`${title} ${summary} ${skillsBundle} ${seniority}`) ??
    matchInterviewTemplateFromText(seniority);

  if (fromVacancy) return fromVacancy;

  const fromCandidate = matchInterviewTemplateFromText(candidateRole);
  return fromCandidate ?? "general";
}
