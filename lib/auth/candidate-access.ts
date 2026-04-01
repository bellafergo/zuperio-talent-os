import type { UserRole } from "@/generated/prisma/enums";

/** RECRUITER and DIRECTOR may create and edit candidates; SALES is view-only. */
export function canManageCandidates(role: UserRole | undefined): boolean {
  return role === "RECRUITER" || role === "DIRECTOR";
}

