import type {
  CandidateStructuredSkillUi,
  VacancyRequirementUi,
} from "./types";

export type CandidateSkillWithSkill = {
  id: string;
  yearsExperience: number | null;
  level: string | null;
  skill: { id: string; name: string; category: string | null };
};

export type VacancyRequirementWithSkill = {
  id: string;
  required: boolean;
  minimumYears: number | null;
  skill: { id: string; name: string; category: string | null };
};

function yearsLabel(y: number | null): string {
  if (y == null) return "";
  if (y <= 0) return "<1 yr";
  if (y === 1) return "1 yr";
  return `${y} yrs`;
}

function minimumYearsLabel(y: number | null): string {
  if (y == null) return "";
  return y === 1 ? "≥1 yr exp." : `≥${y} yrs exp.`;
}

export function mapCandidateSkillToUi(
  row: CandidateSkillWithSkill,
): CandidateStructuredSkillUi {
  return {
    id: row.id,
    skillId: row.skill.id,
    name: row.skill.name,
    category: row.skill.category,
    yearsExperience: row.yearsExperience,
    yearsLabel: yearsLabel(row.yearsExperience),
    level: row.level?.trim() || null,
  };
}

export function mapVacancyRequirementToUi(
  row: VacancyRequirementWithSkill,
): VacancyRequirementUi {
  return {
    id: row.id,
    skillId: row.skill.id,
    name: row.skill.name,
    category: row.skill.category,
    required: row.required,
    minimumYears: row.minimumYears,
    minimumYearsLabel: minimumYearsLabel(row.minimumYears),
  };
}
