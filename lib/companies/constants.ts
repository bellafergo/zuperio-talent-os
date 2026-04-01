import type { CompanyStatus } from "./types";

/** Status labels used in filters and badges (aligned with Prisma `CompanyStatus` enum). */
export const COMPANY_STATUSES: CompanyStatus[] = [
  "Active",
  "Prospect",
  "Paused",
  "Churned",
];
