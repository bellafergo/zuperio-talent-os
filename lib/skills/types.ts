import type { SkillType } from "@/generated/prisma/enums";

export type CandidateStructuredSkillUi = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  skillType: SkillType;
  yearsExperience: number | null;
  yearsLabel: string;
  level: string | null;
};

export type VacancyRequirementUi = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  skillType: SkillType;
  required: boolean;
  minimumYears: number | null;
  minimumYearsLabel: string;
};

export type SkillCatalogRowUi = {
  id: string;
  name: string;
  category: string;
  skillType: SkillType;
  skillTypeLabel: string;
  candidateCount: number;
  vacancyCount: number;
};

export type SkillCatalogGroupUi = {
  categoryLabel: string;
  skills: SkillCatalogRowUi[];
};
