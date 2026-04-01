/**
 * Shared deterministic formatting for proposal preview and email draft layers.
 * Does not compute pricing — only displays numbers already on the record.
 */

import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currency";

export function formatProposalCurrencyAmount(
  amount: number | null | undefined,
  currency: string,
  maximumFractionDigits: 0 | 2 = 2,
): string {
  return formatMoney(amount, currency?.trim() || DEFAULT_CURRENCY, maximumFractionDigits);
}

export function formatProposalPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value == null) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}
