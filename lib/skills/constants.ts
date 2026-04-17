/** Canonical category names used in the skill catalog seed and UI forms. */
export const SKILL_CATEGORIES = [
  "Cloud & Infraestructura",
  "Data & BI",
  "Desarrollo de Software",
  "ERP & Enterprise",
  "Healthcare",
  "Mobile",
  "Project Management & Metodologías",
  "QA & Testing",
  "Soft Skills Técnicos",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
