import type { UserRole } from "@/generated/prisma/enums";

/** RECRUITER and DIRECTOR may update vacancy applications; SALES is view-only. */
export function canManageApplications(role: UserRole | undefined): boolean {
  return role === "RECRUITER" || role === "DIRECTOR";
}

