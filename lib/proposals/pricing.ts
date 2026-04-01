export type ProposalPricingInputs = {
  monthlyHours: number;
  /** Optional: stored for transparency, not used in margin calc yet. */
  candidateNetSalary: number | null;
  /** Optional: stored for transparency, not used in margin calc yet. */
  employerCost: number | null;
  /**
   * Internal cost per hour (major currency units).
   * Deterministic margin uses this + monthlyHours.
   */
  internalCost: number | null;
  /** Client bill rate per hour (major currency units). */
  clientRate: number;
  estimatedDurationMonths: number;
};

export type ProposalPricingComputed = {
  clientMonthlyAmount: number;
  grossMarginAmount: number;
  grossMarginPercent: number;
};

/**
 * Deterministic pricing:
 * - clientMonthlyAmount = monthlyHours * clientRate
 * - internalMonthlyCost = monthlyHours * internalCost (if internalCost provided; else 0)
 * - grossMarginAmount = clientMonthlyAmount - internalMonthlyCost
 * - grossMarginPercent = (grossMarginAmount / clientMonthlyAmount) * 100 (0 when clientMonthlyAmount = 0)
 */
export function computeProposalPricing(
  inputs: ProposalPricingInputs,
): ProposalPricingComputed {
  const monthlyHours = clampNonNegativeInt(inputs.monthlyHours);
  const clientRate = clampNonNegativeNumber(inputs.clientRate);
  const internalCost = inputs.internalCost == null ? 0 : clampNonNegativeNumber(inputs.internalCost);

  const clientMonthlyAmount = round2(monthlyHours * clientRate);
  const internalMonthlyCost = round2(monthlyHours * internalCost);
  const grossMarginAmount = round2(clientMonthlyAmount - internalMonthlyCost);
  const grossMarginPercent =
    clientMonthlyAmount <= 0 ? 0 : round2((grossMarginAmount / clientMonthlyAmount) * 100);

  return { clientMonthlyAmount, grossMarginAmount, grossMarginPercent };
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

