export type ProposalStatusUi = "Draft" | "Sent" | "Accepted" | "Rejected";
export type ProposalTypeUi = "Staff augmentation";
export type ProposalFormatUi = "Simple" | "Detailed";
export type PricingSchemeUi = "Mixed" | "Full IMSS";

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
  format: ProposalFormatUi;
  formatValue: "SIMPLE" | "DETAILED";
  currency: string;
  validityDays: number;
  finalMonthlyRateLabel: string;
  finalMonthlyRateWithVATLabel: string;
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
    schemeValue: "MIXED" | "FULL_IMSS";
    scheme: PricingSchemeUi;
    monthlyHours: number;
    candidateNetSalary: number | null;
    marginPercent: number | null;
    employerLoadPercent: number | null;
    bonuses: number | null;
    benefits: number | null;
    operatingExpenses: number | null;
    discountPercent: number | null;

    grossSalary: number | null;
    employerCost: number | null;
    totalBenefits: number | null;
    totalEmployerLoad: number | null;
    totalOperatingExpenses: number | null;
    subtotal: number | null;
    grossMarginAmount: number;
    grossMarginPercent: number;
    finalMonthlyRate: number | null;
    finalMonthlyRateWithVAT: number | null;
    estimatedDurationMonths: number;
  } | null;
};

export type ProposalCompanyOption = { id: string; name: string };
export type ProposalOpportunityOption = { id: string; title: string; companyId: string };
export type ProposalVacancyOption = { id: string; title: string; companyId: string; opportunityId: string };
export type ProposalCandidateOption = { id: string; name: string };

