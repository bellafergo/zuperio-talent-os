import { prisma } from "@/lib/prisma";

import { mapCompanyToUi } from "./mappers";
import type { Company } from "./types";

export async function listCompaniesForUi(): Promise<Company[]> {
  const rows = await prisma.company.findMany({
    include: { owner: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapCompanyToUi);
}

export async function getCompanyByIdForUi(id: string): Promise<Company | null> {
  const row = await prisma.company.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });
  return row ? mapCompanyToUi(row) : null;
}
