"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageContacts } from "@/lib/auth/contact-access";
import { prisma } from "@/lib/prisma";

import { parseContactForm, parseContactIdentityForm } from "./validation";
import { syncContactPrimaryFields } from "./sync-primary-methods";

export type ContactActionState =
  | { ok: true; contactId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true; userId: string } | { ok: false; state: ContactActionState }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, state: { ok: false, message: "Debes iniciar sesión." } };
  }
  if (!canManageContacts(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "No tienes permiso para modificar contactos." },
    };
  }
  return { ok: true, userId: session.user.id };
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
    return { ok: false, fieldErrors: { companyId: "No se encontró la empresa." } };
  }

  const actor = await prisma.user.findUnique({
    where: { id: gate.userId },
    select: { id: true },
  });
  /** Avoid FK violations if the session user id is stale or missing from DB. */
  const createdById = actor?.id ?? null;

  try {
    const createdId = await prisma.$transaction(async (tx) => {
      const created = await tx.contact.create({
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

      if (data.email) {
        await tx.contactMethod.create({
          data: {
            contactId: created.id,
            type: "EMAIL",
            value: data.email,
            isPrimary: true,
            isActive: true,
            createdById,
          },
        });
      }
      if (data.phone) {
        await tx.contactMethod.create({
          data: {
            contactId: created.id,
            type: "PHONE",
            value: data.phone,
            isPrimary: true,
            isActive: true,
            createdById,
          },
        });
      }

      return created.id;
    });

    await syncContactPrimaryFields(createdId);

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${createdId}`);
    revalidatePath(`/companies/${data.companyId}`);
    return { ok: true, contactId: createdId };
  } catch (err) {
    console.error("[createContact] failed", err);
    return { ok: false, message: "No se pudo crear el contacto. Intenta de nuevo." };
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

  const parsed = parseContactIdentityForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, fieldErrors: { companyId: "No se encontró la empresa." } };
  }

  try {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
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
    return { ok: false, message: "No se pudo actualizar el contacto. Intenta de nuevo." };
  }
}

