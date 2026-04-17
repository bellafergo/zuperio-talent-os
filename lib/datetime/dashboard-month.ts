/**
 * UTC month boundaries for dashboard filters (aligned with stored timestamps).
 */

export type DashboardMonthPeriod = {
  year: number;
  /** 1–12 */
  month: number;
  startUtc: Date;
  /** First instant of the following month (exclusive upper bound). */
  endUtcExclusive: Date;
  /** Human label, e.g. "abril de 2026" */
  label: string;
};

const MIN_YEAR = 2020;
const MAX_YEAR = 2035;

function clampYear(y: number, fallback: number): number {
  if (!Number.isFinite(y)) return fallback;
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, Math.floor(y)));
}

function clampMonth(m: number, fallback: number): number {
  if (!Number.isFinite(m)) return fallback;
  if (m < 1 || m > 12) return fallback;
  return Math.floor(m);
}

/**
 * Parses `month` / `year` from URL search params; defaults to current UTC month.
 */
export function resolveDashboardMonthFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): DashboardMonthPeriod {
  const now = new Date();
  const fallbackY = now.getUTCFullYear();
  const fallbackM = now.getUTCMonth() + 1;

  const monthStr = typeof raw.month === "string" ? raw.month : undefined;
  const yearStr = typeof raw.year === "string" ? raw.year : undefined;

  const year = clampYear(
    yearStr != null ? Number.parseInt(yearStr, 10) : NaN,
    fallbackY,
  );
  const month = clampMonth(
    monthStr != null ? Number.parseInt(monthStr, 10) : NaN,
    fallbackM,
  );

  const startUtc = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endUtcExclusive = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  const label = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(startUtc);

  return {
    year,
    month,
    startUtc,
    endUtcExclusive,
    label,
  };
}
