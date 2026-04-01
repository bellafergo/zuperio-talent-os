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

export type SkillCatalogGroupUi = {
  categoryLabel: string;
  skills: { id: string; name: string }[];
};
