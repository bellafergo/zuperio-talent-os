import { pricingConfig } from "./pricing-config";

export type PricingScheme = "MIXED" | "FULL_IMSS";

export type ProposalPricingInputs = {
  scheme: PricingScheme;
  monthlyHours: number;
  estimatedDurationMonths: number;

  /** Monthly net salary to candidate — required for any monetary outputs. */
  candidateNetSalary: number | null;
  /** Target margin on cost stack (before discount). Uses default when null. */
  marginPercent: number | null;
  /** Employer load as % of gross salary (IMSS, etc.). Uses default when null. */
  employerLoadPercent: number | null;
  benefits: number | null;
  bonuses: number | null;
  operatingExpenses: number | null;
  discountPercent: number | null;
  /**
   * FULL_IMSS gross = net × factor. When null, `pricingConfig.defaultFullImssGrossFactor`.
   */
  fullImssGrossFactor?: number | null;
  /** VAT on final client rate. When null/undefined, `pricingConfig.defaultVatPercent`. */
  vatPercent?: number | null;
};

export type ProposalPricingComputed = {
  /** Same as input net when present — transparency. */
  salaryBaseNet: number | null;
  grossSalary: number | null;
  /** IMSS/load amount: grossSalary × employerLoadPercent. */
  employerLoad: number | null;
  employerCost: number | null;
  /** Monthly bonuses in cost stack (aligned with `bonuses` input). */
  totalBonuses: number;
  totalBenefits: number;
  totalEmployerLoad: number;
  totalOperatingExpenses: number;
  subtotal: number | null;
  /** Client rate before discount: subtotal / (1 − margin). */
  baseMonthlyRateBeforeDiscount: number | null;
  grossMarginAmount: number | null;
  grossMarginPercent: number | null;
  finalMonthlyRate: number | null;
  finalMonthlyRateWithVAT: number | null;
  /** Effective inputs used in the run (for audit UI). */
  resolvedMarginPercent: number;
  resolvedEmployerLoadPercent: number;
  resolvedVatPercent: number;
  resolvedFullImssGrossFactor: number | null;
};

/**
 * Mexico-oriented staffing pricing (deterministic).
 *
 * 1. **Gross salary**
 *    - MIXED: gross = net (no statutory gross-up in this model).
 *    - FULL_IMSS: gross = net × factor (default from config, overridable per proposal).
 *
 * 2. **Employer cost**
 *    - employerLoad = gross × (employerLoadPercent / 100)
 *    - employerCost = gross + employerLoad
 *
 * 3. **Subtotal (internal monthly cost stack)**
 *    - totalBonuses / totalBenefits mirror loaded bonus and benefit lines
 *    - subtotal = employerCost + totalBenefits + totalBonuses + totalOperatingExpenses
 *
 * 4. **Client rate**
 *    - baseMonthlyRateBeforeDiscount = subtotal / (1 − margin)
 *    - finalMonthlyRate = base × (1 − discountPercent / 100)
 *
 * 5. **VAT**
 *    - finalMonthlyRateWithVAT = finalMonthlyRate × (1 + vatPercent / 100)
 */
export function computeProposalPricing(
  inputs: ProposalPricingInputs,
): ProposalPricingComputed {
  const monthlyHours = clampNonNegativeInt(inputs.monthlyHours);
  void monthlyHours;

  const resolvedVatPercent =
    inputs.vatPercent == null || !Number.isFinite(inputs.vatPercent)
      ? pricingConfig.defaultVatPercent
      : clampRange(inputs.vatPercent, 0, 50);

  const resolvedMarginPercent =
    inputs.marginPercent == null || !Number.isFinite(inputs.marginPercent)
      ? pricingConfig.defaultMarginPercent
      : clampRange(inputs.marginPercent, 0, 95);

  const resolvedEmployerLoadPercent =
    inputs.employerLoadPercent == null ||
    !Number.isFinite(inputs.employerLoadPercent)
      ? pricingConfig.defaultEmployerLoadPercent
      : clampRange(inputs.employerLoadPercent, 0, 200);

  const margin = resolvedMarginPercent / 100;
  const employerLoadRate = resolvedEmployerLoadPercent / 100;

  const net =
    inputs.candidateNetSalary == null
      ? null
      : clampNonNegativeNumber(inputs.candidateNetSalary);

  const salaryBaseNet = net;

  const bonuses =
    inputs.bonuses == null ? 0 : clampNonNegativeNumber(inputs.bonuses);
  const benefits =
    inputs.benefits == null ? 0 : clampNonNegativeNumber(inputs.benefits);
  const opex =
    inputs.operatingExpenses == null
      ? 0
      : clampNonNegativeNumber(inputs.operatingExpenses);

  const resolvedFullImssGrossFactor =
    inputs.scheme === "FULL_IMSS"
      ? inputs.fullImssGrossFactor == null ||
        !Number.isFinite(inputs.fullImssGrossFactor)
        ? pricingConfig.defaultFullImssGrossFactor
        : clampRange(inputs.fullImssGrossFactor, 1, 3)
      : null;

  const grossSalary =
    net == null
      ? null
      : inputs.scheme === "FULL_IMSS" && resolvedFullImssGrossFactor != null
        ? round2(net * resolvedFullImssGrossFactor)
        : round2(net);

  const employerLoadAmount =
    grossSalary == null ? null : round2(grossSalary * employerLoadRate);

  const employerCost =
    grossSalary == null || employerLoadAmount == null
      ? null
      : round2(grossSalary + employerLoadAmount);

  const totalBenefits = round2(benefits);
  const totalBonuses = round2(bonuses);
  const totalEmployerLoad = employerLoadAmount ?? 0;
  const totalOperatingExpenses = round2(opex);

  const subtotal =
    employerCost == null
      ? null
      : round2(
          employerCost + totalBenefits + totalBonuses + totalOperatingExpenses,
        );

  const baseMonthlyRateBeforeDiscount =
    subtotal == null ? null : margin >= 1 ? null : round2(subtotal / (1 - margin));

  const discountPct =
    inputs.discountPercent == null || !Number.isFinite(inputs.discountPercent)
      ? 0
      : clampRange(inputs.discountPercent, 0, 100);

  const finalMonthlyRate =
    baseMonthlyRateBeforeDiscount == null
      ? null
      : round2(baseMonthlyRateBeforeDiscount * (1 - discountPct / 100));

  const grossMarginAmount =
    finalMonthlyRate == null || subtotal == null
      ? null
      : round2(finalMonthlyRate - subtotal);

  const grossMarginPercent =
    finalMonthlyRate == null ||
    finalMonthlyRate <= 0 ||
    grossMarginAmount == null
      ? null
      : round2((grossMarginAmount / finalMonthlyRate) * 100);

  const finalMonthlyRateWithVAT =
    finalMonthlyRate == null
      ? null
      : round2(finalMonthlyRate * (1 + resolvedVatPercent / 100));

  return {
    salaryBaseNet,
    grossSalary,
    employerLoad: employerLoadAmount,
    employerCost,
    totalBonuses,
    totalBenefits,
    totalEmployerLoad,
    totalOperatingExpenses,
    subtotal,
    baseMonthlyRateBeforeDiscount,
    grossMarginAmount,
    grossMarginPercent,
    finalMonthlyRate,
    finalMonthlyRateWithVAT,
    resolvedMarginPercent,
    resolvedEmployerLoadPercent,
    resolvedVatPercent,
    resolvedFullImssGrossFactor,
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
