import type { UserRole } from "@/generated/prisma/enums";

/** DIRECTOR and RECRUITER may create/edit weekly logs; SALES is view-only. */
export function canManageWeeklyLogs(role: UserRole | undefined): boolean {
  return role === "DIRECTOR" || role === "RECRUITER";
}

