export type ProposalStatusUi = "Draft" | "Sent" | "Accepted" | "Rejected";
export type ProposalTypeUi = "Staff augmentation";

export type ProposalListRowUi = {
  id: string;
  companyId: string;
  companyName: string;
  opportunityId: string | null;
  opportunityTitle: string;
  vacancyId: string | null;
  vacancyTitle: string;
  candidateId: string | null;
  candidateName: string;
  status: ProposalStatusUi;
  statusValue: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  type: ProposalTypeUi;
  typeValue: "STAFF_AUG";
  currency: string;
  validityDays: number;
  clientMonthlyAmountLabel: string;
  grossMarginPercentLabel: string;
  grossMarginPercentAmount: number | null;
  updatedAtLabel: string;
};

export type ProposalDetailUi = ProposalListRowUi & {
  executiveSummary: string | null;
  profileSummary: string | null;
  scopeNotes: string | null;
  commercialNotes: string | null;
  pricing: {
    monthlyHours: number;
    candidateNetSalary: number | null;
    employerCost: number | null;
    internalCost: number | null;
    clientRate: number;
    clientMonthlyAmount: number;
    grossMarginAmount: number;
    grossMarginPercent: number;
    estimatedDurationMonths: number;
  } | null;
};

export type ProposalCompanyOption = { id: string; name: string };
export type ProposalOpportunityOption = { id: string; title: string; companyId: string };
export type ProposalVacancyOption = { id: string; title: string; companyId: string; opportunityId: string };
export type ProposalCandidateOption = { id: string; name: string };

