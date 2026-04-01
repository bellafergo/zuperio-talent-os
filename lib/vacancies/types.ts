import type {
  VacancySeniority as PrismaVacancySeniority,
  VacancyStatus as PrismaVacancyStatus,
} from "@/generated/prisma/enums";

export type VacancyStatusUi =
  | "Draft"
  | "Open"
  | "On hold"
  | "Sourcing"
  | "Interviewing"
  | "Filled"
  | "Cancelled";

export type VacancySeniorityUi =
  | "Intern"
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
  opportunityId: string;
  opportunityTitle: string;
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
