import type { UserRole } from "@/generated/prisma/enums";

/** SALES and DIRECTOR may create and edit opportunities; RECRUITER is view-only. */
export function canManageOpportunities(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}

