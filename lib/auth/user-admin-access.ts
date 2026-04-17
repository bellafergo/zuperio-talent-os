import type { UserRole } from "@/generated/prisma/enums";

/** Only DIRECTOR may access `/admin/*` user management and related server actions. */
export function canManageUsers(role: UserRole | undefined): boolean {
  return role === "DIRECTOR";
}
