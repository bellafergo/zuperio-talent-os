import type { UserRole } from "@/generated/prisma/enums";

/** SALES and DIRECTOR may create and edit companies; RECRUITER is view-only. */
export function canManageCompanies(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}
