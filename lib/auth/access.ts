import type { UserRole } from "@/generated/prisma/enums";

/** Paths SALES cannot access (recruiting / talent ops). */
const SALES_BLOCKED_PREFIXES = [
  "/skills",
  "/matching",
  "/applications",
  "/active-employees",
] as const;

export function isSalesBlockedPath(pathname: string): boolean {
  return SALES_BLOCKED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export type NavItemDef = {
  href: string;
  label: string;
  roles: readonly UserRole[];
};

export const NAV_ITEMS_BY_ROLE: readonly NavItemDef[] = [
  {
    href: "/",
    label: "Dashboard",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/companies",
    label: "Companies",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/contacts",
    label: "Contacts",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/vacancies",
    label: "Vacancies",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/candidates",
    label: "Candidates",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/skills",
    label: "Skills",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/matching",
    label: "Matching",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/applications",
    label: "Applications",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/active-employees",
    label: "Active Employees",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/weekly-logs",
    label: "Weekly Logs",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
] as const;

export function navItemsForRole(role: UserRole | undefined): NavItemDef[] {
  if (!role) return [];
  return NAV_ITEMS_BY_ROLE.filter((item) => item.roles.includes(role));
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "SALES":
      return "Sales";
    case "RECRUITER":
      return "Recruiter";
    case "DIRECTOR":
      return "Director";
  }
}
