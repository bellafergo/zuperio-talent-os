import type {
  VacancySeniority as PrismaVacancySeniority,
  VacancyStatus as PrismaVacancyStatus,
} from "@/generated/prisma/enums";

export type VacancyStatusUi =
  | "Borrador"
  | "Abierta"
  | "En pausa"
  | "Sourcing"
  | "En entrevistas"
  | "Cubiertas"
  | "Cancelada";

export type VacancySeniorityUi =
  | "Interno"
  | "Junior"
  | "Mid"
  | "Senior"
  | "Lead"
  | "Principal";

export type VacancyListRow = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  opportunityId: string | null;
  opportunityTitle: string | null;
  seniority: VacancySeniorityUi;
  status: VacancyStatusUi;
  /** Prisma enum values for form defaults. */
  seniorityValue: PrismaVacancySeniority;
  statusValue: PrismaVacancyStatus;
  targetRateLabel: string;
  targetRateAmount: number | null;
  currency: string;
  /** Comma-separated skills from DB; null when unset. */
  skillsLine: string | null;
  roleSummaryLine: string | null;
  workModality: string | null;
  updatedAtLabel: string;
};

export type VacancyRequirementDraft = {
  skillId: string;
  required: boolean;
  minimumYears: number | null;
};

export type VacancyFilterState = {
  query: string;
  status: string;
  companyId: string;
  opportunityId: string;
  seniority: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type OpportunityOption = {
  id: string;
  title: string;
};
