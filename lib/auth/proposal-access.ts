import type { UserRole } from "@/generated/prisma/enums";

/** SALES and DIRECTOR may create and edit proposals; RECRUITER is view-only. */
export function canManageProposals(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}

