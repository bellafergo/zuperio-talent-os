import type { UserRole } from "@/generated/prisma/enums";

/** Paths SALES cannot access (recruiting / talent ops). */
const SALES_BLOCKED_PREFIXES = [
  "/skills",
  "/matching",
  "/applications",
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
    label: "Inicio",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/dashboard",
    label: "Comercial",
    roles: ["SALES", "DIRECTOR"],
  },
  {
    href: "/companies",
    label: "Empresas",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/contacts",
    label: "Contactos",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/opportunities",
    label: "Oportunidades",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/vacancies",
    label: "Vacantes",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/candidates",
    label: "Candidatos",
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
    label: "Postulaciones",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/active-employees",
    label: "Empleados activos",
    roles: ["RECRUITER", "DIRECTOR"],
  },
  {
    href: "/weekly-logs",
    label: "Bitácoras semanales",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/proposals",
    label: "Propuestas",
    roles: ["SALES", "RECRUITER", "DIRECTOR"],
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    roles: ["DIRECTOR"],
  },
] as const;

export function navItemsForRole(role: UserRole | undefined): NavItemDef[] {
  if (!role) return [];
  return NAV_ITEMS_BY_ROLE.filter((item) => item.roles.includes(role));
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "SALES":
      return "Ventas";
    case "RECRUITER":
      return "Reclutamiento";
    case "DIRECTOR":
      return "Dirección";
  }
}
