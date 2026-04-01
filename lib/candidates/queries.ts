import { prisma } from "@/lib/prisma";

import { mapCandidateToUi, type CandidateRow } from "./mappers";
import type { CandidateUi } from "./types";

export async function listCandidatesForUi(): Promise<CandidateUi[]> {
  const rows = await prisma.candidate.findMany({
    orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });
  return rows.map((row) => mapCandidateToUi(row as CandidateRow));
}

export async function getCandidateByIdForUi(
  id: string,
): Promise<CandidateUi | null> {
  const row = await prisma.candidate.findUnique({
    where: { id },
  });
  return row ? mapCandidateToUi(row as CandidateRow) : null;
}
