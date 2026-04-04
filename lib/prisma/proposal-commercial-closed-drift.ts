/**
 * Detects DB/schema drift when `Proposal.commercialClosedAt` exists in Prisma schema
 * but the physical database has not been migrated yet.
 */
export function isMissingProposalCommercialClosedAtError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    code?: string;
    name?: string;
    message?: string;
    meta?: { column?: unknown; modelName?: unknown };
  };

  const msg = String(e.message ?? "");

  if (e.code === "P2022") {
    const col = e.meta?.column;
    if (typeof col === "string" && col.includes("commercialClosedAt")) return true;
    if (msg.includes("commercialClosedAt")) return true;
  }

  // PostgreSQL undefined_column in raw / driver message
  if (msg.includes("42703") && msg.includes("commercialClosedAt")) return true;
  if (/column\s+\"?commercialClosedAt\"?\s+does not exist/i.test(msg)) return true;

  return false;
}
