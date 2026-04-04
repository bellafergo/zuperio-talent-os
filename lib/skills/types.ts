export type CandidateStructuredSkillUi = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  yearsExperience: number | null;
  yearsLabel: string;
  level: string | null;
};

export type VacancyRequirementUi = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  required: boolean;
  minimumYears: number | null;
  minimumYearsLabel: string;
};

export type SkillCatalogRowUi = {
  id: string;
  name: string;
  category: string;
  candidateCount: number;
  vacancyCount: number;
};

export type SkillCatalogGroupUi = {
  categoryLabel: string;
  skills: SkillCatalogRowUi[];
};
