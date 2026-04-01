export type PricingScheme = "MIXED" | "FULL_IMSS";

export type ProposalPricingInputs = {
  scheme: PricingScheme;
  monthlyHours: number;
  estimatedDurationMonths: number;

  candidateNetSalary: number | null;
  marginPercent: number | null;
  employerLoadPercent: number | null;
  bonuses: number | null;
  benefits: number | null;
  operatingExpenses: number | null;
  discountPercent: number | null;
  /** Optional computed display (defaults to 16). */
  vatPercent?: number;
};

export type ProposalPricingComputed = {
  grossSalary: number | null;
  employerCost: number | null;
  totalBenefits: number;
  totalEmployerLoad: number;
  totalOperatingExpenses: number;
  subtotal: number | null;
  grossMarginAmount: number | null;
  grossMarginPercent: number | null;
  finalMonthlyRate: number | null;
  finalMonthlyRateWithVAT: number | null;
};

/**
 * Deterministic Zuperio-style pricing foundation (manual-first).
 *
 * Simple, explainable rule set:
 * - Treat `candidateNetSalary` as the base monthly compensation input.
 * - Derive `grossSalary` using a fixed uplift factor when scheme is FULL_IMSS.
 * - Compute employer load as percent of (grossSalary for FULL_IMSS, net salary for MIXED).
 * - Subtotal = employerCost + benefits + operating expenses + bonuses.
 * - Final monthly rate is computed from desired margin percent:
 *   finalMonthlyRate = subtotal / (1 - marginPercent)
 * - Apply optional discountPercent on finalMonthlyRate.
 * - VAT is display-only: finalMonthlyRateWithVAT = finalMonthlyRate * (1 + vatPercent).
 *
 * This is designed to match a "calculator concept" while staying deterministic and auditable.
 * Constants are centralized for later tuning once exact Zuperio rates are confirmed.
 */
export function computeProposalPricing(
  inputs: ProposalPricingInputs,
): ProposalPricingComputed {
  const monthlyHours = clampNonNegativeInt(inputs.monthlyHours);
  const vatPercent = inputs.vatPercent ?? 16;

  const net = inputs.candidateNetSalary == null ? null : clampNonNegativeNumber(inputs.candidateNetSalary);
  const bonuses = inputs.bonuses == null ? 0 : clampNonNegativeNumber(inputs.bonuses);
  const benefits = inputs.benefits == null ? 0 : clampNonNegativeNumber(inputs.benefits);
  const opex = inputs.operatingExpenses == null ? 0 : clampNonNegativeNumber(inputs.operatingExpenses);

  const marginPct =
    inputs.marginPercent == null ? DEFAULT_MARGIN_PERCENT : clampRange(inputs.marginPercent, 0, 95);
  const margin = marginPct / 100;

  const employerLoadPct =
    inputs.employerLoadPercent == null
      ? DEFAULT_EMPLOYER_LOAD_PERCENT
      : clampRange(inputs.employerLoadPercent, 0, 200);
  const employerLoad = employerLoadPct / 100;

  const grossSalary =
    net == null
      ? null
      : inputs.scheme === "FULL_IMSS"
        ? round2(net * FULL_IMSS_GROSS_UPLIFT)
        : round2(net);

  const loadBase = grossSalary == null ? null : inputs.scheme === "FULL_IMSS" ? grossSalary : net;
  const totalEmployerLoad =
    loadBase == null ? 0 : round2(loadBase * employerLoad);

  const employerCost =
    grossSalary == null ? null : round2(grossSalary + totalEmployerLoad);

  const totalBenefits = round2(benefits);
  const totalOperatingExpenses = round2(opex);

  const subtotal =
    employerCost == null ? null : round2(employerCost + bonuses + totalBenefits + totalOperatingExpenses);

  const baseRate =
    subtotal == null ? null : margin >= 1 ? null : round2(subtotal / (1 - margin));

  const discountPct =
    inputs.discountPercent == null ? 0 : clampRange(inputs.discountPercent, 0, 100);
  const finalMonthlyRate =
    baseRate == null ? null : round2(baseRate * (1 - discountPct / 100));

  const grossMarginAmount =
    finalMonthlyRate == null || subtotal == null ? null : round2(finalMonthlyRate - subtotal);
  const grossMarginPercent =
    finalMonthlyRate == null || finalMonthlyRate <= 0 || grossMarginAmount == null
      ? null
      : round2((grossMarginAmount / finalMonthlyRate) * 100);

  const finalMonthlyRateWithVAT =
    finalMonthlyRate == null ? null : round2(finalMonthlyRate * (1 + vatPercent / 100));

  // monthlyHours currently not used for computations; kept for future hourly display.
  void monthlyHours;

  return {
    grossSalary,
    employerCost,
    totalBenefits,
    totalEmployerLoad,
    totalOperatingExpenses,
    subtotal,
    grossMarginAmount,
    grossMarginPercent,
    finalMonthlyRate,
    finalMonthlyRateWithVAT,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampNonNegativeInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function clampNonNegativeNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function clampRange(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

const DEFAULT_MARGIN_PERCENT = 35;
const DEFAULT_EMPLOYER_LOAD_PERCENT = 30;
const FULL_IMSS_GROSS_UPLIFT = 1.25;

