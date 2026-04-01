export type ProposalStatusUi =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "In negotiation"
  | "Won"
  | "Lost";

export type ProposalStatusValue =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "IN_NEGOTIATION"
  | "WON"
  | "LOST";
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
  statusValue: ProposalStatusValue;
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
  /** ISO-8601 UTC timestamp of last successful economic PDF export, if any. */
  proposalPdfExportedAt: string | null;
  /** ISO-8601 UTC timestamp of last CV PDF export for the linked candidate, if any. */
  candidateCvExportedAt: string | null;
  sentAt: string | null;
  lastFollowUpAt: string | null;
  followUpCount: number;
  isFollowUpPending: boolean;
  sentAtLabel: string;
  lastFollowUpAtLabel: string;
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
    /** Stored override; null → engine uses `pricingConfig.defaultFullImssGrossFactor` for FULL_IMSS. */
    fullImssGrossFactor: number | null;
    /** Stored override; null → engine uses `pricingConfig.defaultVatPercent`. */
    vatPercent: number | null;

    grossSalary: number | null;
    employerCost: number | null;
    totalBenefits: number | null;
    totalEmployerLoad: number | null;
    totalOperatingExpenses: number | null;
    subtotal: number | null;
    /** Client rate before discount: subtotal / (1 − target margin). */
    baseMonthlyRateBeforeDiscount: number | null;
    grossMarginAmount: number | null;
    grossMarginPercent: number | null;
    finalMonthlyRate: number | null;
    finalMonthlyRateWithVAT: number | null;
    estimatedDurationMonths: number;
  } | null;
};

export type ProposalCompanyOption = { id: string; name: string };
export type ProposalOpportunityOption = { id: string; title: string; companyId: string };
export type ProposalVacancyOption = { id: string; title: string; companyId: string; opportunityId: string };
export type ProposalCandidateOption = { id: string; name: string };

