import type { UserRole } from "@/generated/prisma/enums";

/** SALES and DIRECTOR may create and edit vacancies; RECRUITER is view-only for now. */
export function canManageVacancies(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}

