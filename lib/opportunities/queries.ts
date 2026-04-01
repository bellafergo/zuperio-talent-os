import { prisma } from "@/lib/prisma";

import {
  mapOpportunityToListRow,
  type OpportunityWithRelations,
} from "./mappers";
import type { OpportunityListRow } from "./types";

export async function listOpportunitiesForUi(): Promise<OpportunityListRow[]> {
  const rows = await prisma.opportunity.findMany({
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
  return rows.map((row) =>
    mapOpportunityToListRow(row as unknown as OpportunityWithRelations),
  );
}

export async function getOpportunityByIdForUi(
  id: string,
): Promise<OpportunityListRow | null> {
  const row = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });
  return row
    ? mapOpportunityToListRow(row as unknown as OpportunityWithRelations)
    : null;
}
