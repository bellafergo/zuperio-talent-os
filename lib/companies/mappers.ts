import type { CompanyStatus as PrismaCompanyStatus } from "@/generated/prisma/enums";

import type { Company } from "./types";

const prismaStatusToUi: Record<PrismaCompanyStatus, Company["status"]> = {
  ACTIVE: "Active",
  PROSPECT: "Prospect",
  PAUSED: "Paused",
  CHURNED: "Churned",
};

export type CompanyWithOwner = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  status: PrismaCompanyStatus;
  ownerId: string | null;
  owner: { name: string | null } | null;
};

export function mapCompanyToUi(row: CompanyWithOwner): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? "",
    location: row.location ?? "",
    owner: row.owner?.name?.trim() || "—",
    ownerId: row.ownerId,
    status: prismaStatusToUi[row.status],
    statusValue: row.status,
  };
}
