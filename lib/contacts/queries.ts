import { prisma } from "@/lib/prisma";

import { mapContactToListRow, type ContactWithCompany } from "./mappers";
import type { ContactListRow } from "./types";

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
