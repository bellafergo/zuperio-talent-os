"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageContacts } from "@/lib/auth/contact-access";
import { prisma } from "@/lib/prisma";

import { parseContactForm } from "./validation";

export type ContactActionState =
  | { ok: true; contactId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: ContactActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageContacts(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "You do not have permission to change contacts." },
    };
  }
  return { ok: true };
}

export async function createContact(
  _prev: ContactActionState | null,
  formData: FormData,
): Promise<ContactActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseContactForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };
  }

  try {
    const created = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        companyId: data.companyId,
        status: data.status,
      },
      select: { id: true },
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${created.id}`);
    revalidatePath(`/companies/${data.companyId}`);
    return { ok: true, contactId: created.id };
  } catch {
    return { ok: false, message: "Could not create the contact. Try again." };
  }
}

export async function updateContact(
  _prev: ContactActionState | null,
  formData: FormData,
): Promise<ContactActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("contactId");
  const contactId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!contactId) return { ok: false, message: "Missing contact id." };

  const existing = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true, companyId: true },
  });
  if (!existing) return { ok: false, message: "Contact was not found." };

  const parsed = parseContactForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };
  }

  try {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        companyId: data.companyId,
        status: data.status,
      },
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${contactId}`);
    revalidatePath(`/companies/${existing.companyId}`);
    if (existing.companyId !== data.companyId) {
      revalidatePath(`/companies/${data.companyId}`);
    }
    return { ok: true, contactId };
  } catch {
    return { ok: false, message: "Could not update the contact. Try again." };
  }
}

