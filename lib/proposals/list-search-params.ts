import { ProposalStatus as StatusConst, type ProposalStatus } from "@/generated/prisma/enums";

import type { ProposalListFilters } from "./queries";

const STATUS_VALUES = new Set<string>(Object.values(StatusConst));

export function parseProposalListSearchParams(raw: {
  status?: string | string[];
  followUp?: string | string[];
}): ProposalListFilters {
  const statusRaw = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const followRaw = Array.isArray(raw.followUp) ? raw.followUp[0] : raw.followUp;

  const followUpPendingOnly = followRaw === "1";
  const status =
    statusRaw && STATUS_VALUES.has(statusRaw) ? (statusRaw as ProposalStatus) : undefined;

  return { status, followUpPendingOnly };
}
