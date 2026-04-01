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
  targetRateLabel: string;
  targetRateAmount: number | null;
  currency: string;
  updatedAtLabel: string;
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
