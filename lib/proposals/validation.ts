import {
  ProposalStatus as StatusConst,
  ProposalType as TypeConst,
  type ProposalStatus,
  type ProposalType,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(StatusConst));
const TYPE_SET = new Set<string>(Object.values(TypeConst));

export type ProposalFormParsed = {
  companyId: string;
  opportunityId: string | null;
  vacancyId: string | null;
  candidateId: string | null;
  type: ProposalType;
  status: ProposalStatus;
  currency: string;
  validityDays: number;
  executiveSummary: string | null;
  profileSummary: string | null;
  scopeNotes: string | null;
  commercialNotes: string | null;

  monthlyHours: number;
  candidateNetSalary: number | null;
  employerCost: number | null;
  internalCost: number | null;
  clientRate: number;
  estimatedDurationMonths: number;
};

export type ProposalFormValidationResult =
  | { ok: true; data: ProposalFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function opt(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function req(formData: FormData, key: string): string {
  return opt(formData, key) ?? "";
}

function parseOptionalNumber(raw: string | null): number | null | "invalid" {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return "invalid";
  return n;
}

export function parseProposalForm(formData: FormData): ProposalFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const companyId = req(formData, "companyId");
  if (!companyId) fieldErrors.companyId = "Company is required.";

  const opportunityId = opt(formData, "opportunityId");
  const vacancyId = opt(formData, "vacancyId");
  const candidateId = opt(formData, "candidateId");

  const typeRaw = opt(formData, "type") ?? "";
  if (!typeRaw || !TYPE_SET.has(typeRaw)) fieldErrors.type = "Select a valid type.";

  const statusRaw = opt(formData, "status") ?? "";
  if (!statusRaw || !STATUS_SET.has(statusRaw)) fieldErrors.status = "Select a valid status.";

  const currencyRaw = opt(formData, "currency");
  const currency = currencyRaw ? currencyRaw.toUpperCase() : "EUR";
  if (!/^[A-Z]{3}$/.test(currency)) fieldErrors.currency = "Currency must be a 3-letter code.";

  const validityDaysRaw = opt(formData, "validityDays");
  const validityDaysN = validityDaysRaw ? Number(validityDaysRaw) : 14;
  if (!Number.isFinite(validityDaysN) || validityDaysN < 1 || validityDaysN > 365) {
    fieldErrors.validityDays = "Validity must be between 1 and 365 days.";
  }

  const executiveSummary = opt(formData, "executiveSummary");
  const profileSummary = opt(formData, "profileSummary");
  const scopeNotes = opt(formData, "scopeNotes");
  const commercialNotes = opt(formData, "commercialNotes");

  const monthlyHoursRaw = opt(formData, "monthlyHours");
  const monthlyHoursN = monthlyHoursRaw ? Number(monthlyHoursRaw) : NaN;
  if (!Number.isFinite(monthlyHoursN) || monthlyHoursN <= 0) {
    fieldErrors.monthlyHours = "Monthly hours must be greater than 0.";
  }

  const clientRateRaw = opt(formData, "clientRate");
  const clientRateN = clientRateRaw ? Number(clientRateRaw) : NaN;
  if (!Number.isFinite(clientRateN) || clientRateN < 0) {
    fieldErrors.clientRate = "Client rate must be 0 or higher.";
  }

  const internalCostVal = parseOptionalNumber(opt(formData, "internalCost"));
  if (internalCostVal === "invalid" || (typeof internalCostVal === "number" && internalCostVal < 0)) {
    fieldErrors.internalCost = "Internal cost must be 0 or higher.";
  }

  const candidateNetSalaryVal = parseOptionalNumber(opt(formData, "candidateNetSalary"));
  if (
    candidateNetSalaryVal === "invalid" ||
    (typeof candidateNetSalaryVal === "number" && candidateNetSalaryVal < 0)
  ) {
    fieldErrors.candidateNetSalary = "Candidate net salary must be 0 or higher.";
  }

  const employerCostVal = parseOptionalNumber(opt(formData, "employerCost"));
  if (employerCostVal === "invalid" || (typeof employerCostVal === "number" && employerCostVal < 0)) {
    fieldErrors.employerCost = "Employer cost must be 0 or higher.";
  }

  const estMonthsRaw = opt(formData, "estimatedDurationMonths");
  const estMonthsN = estMonthsRaw ? Number(estMonthsRaw) : 6;
  if (!Number.isFinite(estMonthsN) || estMonthsN < 1 || estMonthsN > 60) {
    fieldErrors.estimatedDurationMonths = "Duration must be between 1 and 60 months.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      companyId,
      opportunityId,
      vacancyId,
      candidateId,
      type: typeRaw as ProposalType,
      status: statusRaw as ProposalStatus,
      currency,
      validityDays: Math.floor(validityDaysN),
      executiveSummary,
      profileSummary,
      scopeNotes,
      commercialNotes,
      monthlyHours: Math.floor(monthlyHoursN),
      candidateNetSalary: typeof candidateNetSalaryVal === "number" ? candidateNetSalaryVal : null,
      employerCost: typeof employerCostVal === "number" ? employerCostVal : null,
      internalCost: typeof internalCostVal === "number" ? internalCostVal : null,
      clientRate: clientRateN,
      estimatedDurationMonths: Math.floor(estMonthsN),
    },
  };
}

