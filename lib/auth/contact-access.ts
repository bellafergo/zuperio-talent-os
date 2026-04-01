import type { UserRole } from "@/generated/prisma/enums";

/** SALES and DIRECTOR may create and edit contacts; RECRUITER is view-only. */
export function canManageContacts(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}

