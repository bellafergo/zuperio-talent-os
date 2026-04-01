import type { OpportunityStage as PrismaOpportunityStage } from "@/generated/prisma/enums";

import type { OpportunityListRow, OpportunityStageUi } from "./types";

const prismaStageToUi: Record<PrismaOpportunityStage, OpportunityStageUi> = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
};

function formatUpdatedAt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export type OpportunityWithRelations = {
  id: string;
  title: string;
  stage: PrismaOpportunityStage;
  value: { toString(): string } | number | string | null;
  currency: string | null;
  companyId: string;
  ownerId: string | null;
  updatedAt: Date;
  company: { id: string; name: string };
  owner: { id: string; name: string | null } | null;
};

function parseValue(
  value: OpportunityWithRelations["value"],
): number | null {
  if (value == null) return null;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    const n = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatOpportunityCurrency(
  amount: number | null,
  currency: string,
) {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}

export function mapOpportunityToListRow(row: OpportunityWithRelations): OpportunityListRow {
  const currency = row.currency?.trim() || "EUR";
  const amount = parseValue(row.value);
  return {
    id: row.id,
    title: row.title,
    companyId: row.companyId,
    companyName: row.company.name,
    ownerId: row.ownerId,
    ownerName: row.owner?.name?.trim() || "—",
    stage: prismaStageToUi[row.stage],
    stageValue: row.stage,
    valueLabel: formatOpportunityCurrency(amount, currency),
    valueAmount: amount,
    currency,
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
