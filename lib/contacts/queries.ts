import { prisma } from "@/lib/prisma";

import { mapContactToListRow, type ContactWithCompany } from "./mappers";
import type { CompanyOption, ContactListRow, ContactMethodRowUi } from "./types";

export async function listContactsForUi(): Promise<ContactListRow[]> {
  const rows = await prisma.contact.findMany({
    include: {
      company: { select: { id: true, name: true } },
    },
    orderBy: [{ company: { name: "asc" } }, { firstName: "asc" }, { lastName: "asc" }],
  });
  return rows.map((row) => mapContactToListRow(row as ContactWithCompany));
}

export async function getContactByIdForUi(
  id: string,
): Promise<ContactListRow | null> {
  const row = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
    },
  });
  return row ? mapContactToListRow(row as ContactWithCompany) : null;
}

const TYPE_UI: Record<
  "PHONE" | "EMAIL" | "WHATSAPP" | "LINKEDIN",
  ContactMethodRowUi["type"]
> = {
  PHONE: "Teléfono",
  EMAIL: "Correo",
  WHATSAPP: "WhatsApp",
  LINKEDIN: "LinkedIn",
};

function formatMethodAt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export async function listContactMethodsForContact(
  contactId: string,
): Promise<ContactMethodRowUi[]> {
  const rows = await prisma.contactMethod.findMany({
    where: { contactId },
    include: {
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    type: TYPE_UI[r.type],
    typeValue: r.type,
    value: r.value,
    label: r.label,
    isPrimary: r.isPrimary,
    isActive: r.isActive,
    notes: r.notes,
    createdAtLabel: formatMethodAt(r.createdAt),
    createdByLabel:
      r.createdBy?.name?.trim() ||
      r.createdBy?.email?.trim() ||
      "—",
  }));
}

export async function listCompaniesForContactForm(): Promise<CompanyOption[]> {
  return prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }],
  });
}
