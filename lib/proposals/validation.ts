import {
  ProposalStatus as StatusConst,
  ProposalType as TypeConst,
  type ProposalStatus,
  type ProposalType,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(StatusConst));
const TYPE_SET = new Set<string>(Object.values(TypeConst));
const FORMAT_SET = new Set<string>(["SIMPLE", "DETAILED"]);
const SCHEME_SET = new Set<string>(["MIXED", "FULL_IMSS"]);

export type ProposalFormParsed = {
  companyId: string;
  opportunityId: string | null;
  vacancyId: string | null;
  candidateId: string | null;
  type: ProposalType;
  format: "SIMPLE" | "DETAILED";
  status: ProposalStatus;
  currency: string;
  validityDays: number;
  executiveSummary: string | null;
  profileSummary: string | null;
  scopeNotes: string | null;
  commercialNotes: string | null;

  monthlyHours: number;
  candidateNetSalary: number;
  scheme: "MIXED" | "FULL_IMSS";
  marginPercent: number | null;
  employerLoadPercent: number | null;
  bonuses: number | null;
  benefits: number | null;
  operatingExpenses: number | null;
  discountPercent: number | null;
  estimatedDurationMonths: number;
  /** Null → engine uses `pricingConfig.defaultVatPercent`. */
  vatPercent: number | null;
  /** Null → engine uses `pricingConfig.defaultFullImssGrossFactor` for FULL_IMSS. */
  fullImssGrossFactor: number | null;
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

  const formatRaw = opt(formData, "format") ?? "SIMPLE";
  if (!FORMAT_SET.has(formatRaw)) fieldErrors.format = "Select a valid format.";

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

  const netSalaryRaw = opt(formData, "candidateNetSalary");
  if (!netSalaryRaw) {
    fieldErrors.candidateNetSalary = "Candidate net salary is required.";
  }
  const candidateNetSalaryVal = parseOptionalNumber(netSalaryRaw);
  if (
    !fieldErrors.candidateNetSalary &&
    (candidateNetSalaryVal === "invalid" ||
      (typeof candidateNetSalaryVal === "number" && candidateNetSalaryVal < 0))
  ) {
    fieldErrors.candidateNetSalary = "Candidate net salary must be 0 or higher.";
  }

  const schemeRaw = opt(formData, "scheme") ?? "MIXED";
  if (!SCHEME_SET.has(schemeRaw)) fieldErrors.scheme = "Select a valid pricing scheme.";

  const marginVal = parseOptionalNumber(opt(formData, "marginPercent"));
  if (marginVal === "invalid" || (typeof marginVal === "number" && (marginVal < 0 || marginVal > 95))) {
    fieldErrors.marginPercent = "Margin percent must be between 0 and 95.";
  }

  const loadVal = parseOptionalNumber(opt(formData, "employerLoadPercent"));
  if (loadVal === "invalid" || (typeof loadVal === "number" && (loadVal < 0 || loadVal > 200))) {
    fieldErrors.employerLoadPercent = "Employer load percent must be between 0 and 200.";
  }

  const bonusesVal = parseOptionalNumber(opt(formData, "bonuses"));
  if (bonusesVal === "invalid" || (typeof bonusesVal === "number" && bonusesVal < 0)) {
    fieldErrors.bonuses = "Bonuses must be 0 or higher.";
  }

  const benefitsVal = parseOptionalNumber(opt(formData, "benefits"));
  if (benefitsVal === "invalid" || (typeof benefitsVal === "number" && benefitsVal < 0)) {
    fieldErrors.benefits = "Benefits must be 0 or higher.";
  }

  const opexVal = parseOptionalNumber(opt(formData, "operatingExpenses"));
  if (opexVal === "invalid" || (typeof opexVal === "number" && opexVal < 0)) {
    fieldErrors.operatingExpenses = "Operating expenses must be 0 or higher.";
  }

  const discountVal = parseOptionalNumber(opt(formData, "discountPercent"));
  if (
    discountVal === "invalid" ||
    (typeof discountVal === "number" && (discountVal < 0 || discountVal > 100))
  ) {
    fieldErrors.discountPercent = "Discount percent must be between 0 and 100.";
  }

  const estMonthsRaw = opt(formData, "estimatedDurationMonths");
  const estMonthsN = estMonthsRaw ? Number(estMonthsRaw) : 6;
  if (!Number.isFinite(estMonthsN) || estMonthsN < 1 || estMonthsN > 60) {
    fieldErrors.estimatedDurationMonths = "Duration must be between 1 and 60 months.";
  }

  const vatVal = parseOptionalNumber(opt(formData, "vatPercent"));
  if (vatVal === "invalid" || (typeof vatVal === "number" && (vatVal < 0 || vatVal > 50))) {
    fieldErrors.vatPercent = "VAT percent must be between 0 and 50.";
  }

  const factorVal = parseOptionalNumber(opt(formData, "fullImssGrossFactor"));
  if (
    factorVal === "invalid" ||
    (typeof factorVal === "number" && (factorVal < 1 || factorVal > 3))
  ) {
    fieldErrors.fullImssGrossFactor = "Full IMSS gross factor must be between 1 and 3.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  if (typeof candidateNetSalaryVal !== "number") {
    return {
      ok: false,
      fieldErrors: { candidateNetSalary: "Candidate net salary is required." },
    };
  }

  return {
    ok: true,
    data: {
      companyId,
      opportunityId,
      vacancyId,
      candidateId,
      type: typeRaw as ProposalType,
      format: formatRaw as ProposalFormParsed["format"],
      status: statusRaw as ProposalStatus,
      currency,
      validityDays: Math.floor(validityDaysN),
      executiveSummary,
      profileSummary,
      scopeNotes,
      commercialNotes,
      monthlyHours: Math.floor(monthlyHoursN),
      candidateNetSalary: candidateNetSalaryVal,
      scheme: schemeRaw as ProposalFormParsed["scheme"],
      marginPercent: typeof marginVal === "number" ? marginVal : null,
      employerLoadPercent: typeof loadVal === "number" ? loadVal : null,
      bonuses: typeof bonusesVal === "number" ? bonusesVal : null,
      benefits: typeof benefitsVal === "number" ? benefitsVal : null,
      operatingExpenses: typeof opexVal === "number" ? opexVal : null,
      discountPercent: typeof discountVal === "number" ? discountVal : null,
      estimatedDurationMonths: Math.floor(estMonthsN),
      vatPercent: typeof vatVal === "number" ? vatVal : null,
      fullImssGrossFactor: typeof factorVal === "number" ? factorVal : null,
    },
  };
}

