import type { UserRole } from "@/generated/prisma/enums";

/** Commercial / revenue dashboard: Sales and Director only. */
export function canViewCommercialDashboard(role: UserRole | undefined): boolean {
  return role === "SALES" || role === "DIRECTOR";
}
