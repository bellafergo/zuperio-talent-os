import type { ContactStatus as PrismaContactStatus } from "@/generated/prisma/enums";

import type { ContactListRow, ContactStatusUi } from "./types";

const prismaStatusToUi: Record<PrismaContactStatus, ContactStatusUi> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export type ContactWithCompany = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: PrismaContactStatus;
  companyId: string;
  company: { id: string; name: string };
  updatedAt: Date;
};

function displayName(row: Pick<ContactWithCompany, "firstName" | "lastName">) {
  const parts = [row.firstName, row.lastName].filter(Boolean);
  return parts.join(" ").trim() || row.firstName;
}

function formatUpdatedAt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function mapContactToListRow(row: ContactWithCompany): ContactListRow {
  return {
    id: row.id,
    displayName: displayName(row),
    title: row.title?.trim() || "—",
    companyId: row.companyId,
    companyName: row.company.name,
    email: row.email?.trim() || "—",
    phone: row.phone?.trim() || "—",
    status: prismaStatusToUi[row.status],
    firstName: row.firstName,
    lastName: row.lastName?.trim() || "",
    titleValue: row.title?.trim() || "",
    emailValue: row.email?.trim() || "",
    phoneValue: row.phone?.trim() || "",
    statusValue: row.status,
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
