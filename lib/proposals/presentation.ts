/**
 * Shared deterministic formatting for proposal preview and email draft layers.
 * Does not compute pricing — only displays numbers already on the record.
 */

export function formatProposalCurrencyAmount(
  amount: number | null | undefined,
  currency: string,
  maximumFractionDigits: 0 | 2 = 2,
): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "EUR";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US", { maximumFractionDigits })} ${c}`;
  }
}

export function formatProposalPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value == null) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}
