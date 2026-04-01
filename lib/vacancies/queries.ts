import { prisma } from "@/lib/prisma";

import { mapVacancyToListRow, type VacancyWithRelations } from "./mappers";
import type { VacancyListRow } from "./types";

const vacancyInclude = {
  opportunity: {
    select: {
      id: true,
      title: true,
      company: { select: { id: true, name: true } },
    },
  },
} as const;

export async function listVacanciesForUi(): Promise<VacancyListRow[]> {
  const rows = await prisma.vacancy.findMany({
    include: vacancyInclude,
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
  return rows.map((row) =>
    mapVacancyToListRow(row as unknown as VacancyWithRelations),
  );
}

export async function getVacancyByIdForUi(
  id: string,
): Promise<VacancyListRow | null> {
  const row = await prisma.vacancy.findUnique({
    where: { id },
    include: vacancyInclude,
  });
  return row ? mapVacancyToListRow(row as unknown as VacancyWithRelations) : null;
}
