import type { CompanyStatus as PrismaCompanyStatus } from "@/generated/prisma/enums";

export type CompanyStatus = "Activa" | "Prospecto" | "En pausa" | "Baja";

export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
  owner: string;
  /** For owner select in create/edit forms */
  ownerId: string | null;
  status: CompanyStatus;
  /** Prisma enum value for form defaults */
  statusValue: PrismaCompanyStatus;
};

export type CompanyFilterState = {
  query: string;
  status: string;
  industry: string;
  owner: string;
};
