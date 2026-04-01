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

export type CompanyOwnerOption = {
  id: string;
  name: string | null;
  email: string;
};

/** Users eligible as company owner in forms (internal directory). */
export async function listUsersForCompanyForm(): Promise<CompanyOwnerOption[]> {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}
