import type { UserRole } from "@/generated/prisma/enums";

/** DIRECTOR and RECRUITER may create/edit placements; SALES is view-only. */
export function canManagePlacements(role: UserRole | undefined): boolean {
  return role === "DIRECTOR" || role === "RECRUITER";
}

