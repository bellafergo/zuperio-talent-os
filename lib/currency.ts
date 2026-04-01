/**
 * Zuperio currency rules: MXN primary, USD secondary (staffing / Mexico ops).
 * Formatting uses es-MX for consistent grouping and symbols in product UI and PDFs.
 */

export const DEFAULT_CURRENCY = "MXN";
export const SUPPORTED_CURRENCIES = ["MXN", "USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const FORMAT_LOCALE = "es-MX";

export function isSupportedCurrency(code: string | null | undefined): boolean {
  const c = code?.trim().toUpperCase();
  return c === "MXN" || c === "USD";
}

/** Coerce invalid / legacy codes to MXN for new inputs only; use raw code for formatting when displaying stored rows. */
export function normalizeNewCurrency(code: string | null | undefined): SupportedCurrency {
  return isSupportedCurrency(code) ? (code!.trim().toUpperCase() as SupportedCurrency) : DEFAULT_CURRENCY;
}

/** Split revenue sums by currency for dashboards (legacy rows may land in `other`). */
export type CurrencyValueSum = { mxn: number; usd: number; other: number };

export function emptyCurrencySum(): CurrencyValueSum {
  return { mxn: 0, usd: 0, other: 0 };
}

export function addToCurrencySum(
  sum: CurrencyValueSum,
  currency: string | null | undefined,
  amount: number,
): void {
  const c = currency?.trim().toUpperCase();
  if (c === "MXN") sum.mxn += amount;
  else if (c === "USD") sum.usd += amount;
  else sum.other += amount;
}

/**
 * Format monetary amounts for proposals, tables, and PDFs.
 * Pass the stored ISO code (MXN, USD, or legacy e.g. EUR) so existing data still displays correctly.
 */
export function formatMoney(
  amount: number | null | undefined,
  currencyCode: string,
  maximumFractionDigits: 0 | 2 = 2,
): string {
  if (amount == null) return "—";
  const c = currencyCode?.trim() || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(FORMAT_LOCALE, {
      style: "currency",
      currency: c.length === 3 ? c : DEFAULT_CURRENCY,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(FORMAT_LOCALE, { maximumFractionDigits })} ${c}`;
  }
}

/** Display combined MXN + USD + other numeric totals (no FX conversion). */
export function formatCurrencyValueSum(sum: CurrencyValueSum, maximumFractionDigits: 0 | 2 = 0): string {
  const parts: string[] = [];
  if (sum.mxn > 0) parts.push(formatMoney(sum.mxn, "MXN", maximumFractionDigits));
  if (sum.usd > 0) parts.push(formatMoney(sum.usd, "USD", maximumFractionDigits));
  if (sum.other > 0) {
    parts.push(
      `${sum.other.toLocaleString(FORMAT_LOCALE, { maximumFractionDigits })} (otra divisa)`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}
