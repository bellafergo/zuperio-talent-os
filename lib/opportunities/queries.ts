import { prisma } from "@/lib/prisma";

import {
  mapOpportunityToListRow,
  type OpportunityWithRelations,
} from "./mappers";
import type { OpportunityListRow } from "./types";

export type OpportunityCompanyOption = { id: string; name: string };
export type OpportunityOwnerOption = { id: string; name: string | null; email: string };

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

export async function listOpportunitiesForCompanyUi(companyId: string): Promise<OpportunityListRow[]> {
  try {
    const rows = await prisma.opportunity.findMany({
      where: { companyId },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
    return rows.map((row) =>
      mapOpportunityToListRow(row as unknown as OpportunityWithRelations),
    );
  } catch (err) {
    console.error("[listOpportunitiesForCompanyUi] failed:", err);
    return [];
  }
}

export async function listCompaniesForOpportunityForm(): Promise<
  OpportunityCompanyOption[]
> {
  return prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }],
  });
}

export async function listUsersForOpportunityForm(): Promise<
  OpportunityOwnerOption[]
> {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}
