import type { UserRole } from "@/generated/prisma/enums";

/** Only Dirección can add or edit catalog skills. */
export function canManageSkills(role: UserRole | null | undefined): boolean {
  return role === "DIRECTOR";
}
