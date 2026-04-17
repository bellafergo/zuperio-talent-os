/**
 * Organisation-wide defaults for proposal pricing (Mexico staffing model).
 * Adjust here to tune IMSS uplift, load, margin, and VAT without code changes elsewhere.
 */
export const pricingConfig = {
  /** When `employerLoadPercent` is omitted on the proposal, use this (IMSS, payroll tax, etc.). */
  defaultEmployerLoadPercent: 30,
  /** When `marginPercent` is omitted, use this target margin on subtotal (before discount). */
  defaultMarginPercent: 35,
  /**
   * FULL_IMSS: gross monthly salary = net × factor (statutory gross-up).
   * Override per proposal via stored `fullImssGrossFactor` when set.
   */
  defaultFullImssGrossFactor: 1.25,
  /** VAT applied to final monthly client rate (display / invoice). */
  defaultVatPercent: 16,
} as const;

export type PricingConfig = typeof pricingConfig;
