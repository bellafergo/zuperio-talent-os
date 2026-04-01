"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  canManageContactMethodDirectory,
  canManageContacts,
} from "@/lib/auth/contact-access";
import { prisma } from "@/lib/prisma";

import { parseAddContactMethodForm } from "./contact-method-validation";
import { syncContactPrimaryFields } from "./sync-primary-methods";

export type ContactMethodActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

export async function addContactMethod(
  _prev: ContactMethodActionState | null,
  formData: FormData,
): Promise<ContactMethodActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Debes iniciar sesión." };
  }
  if (!canManageContacts(session.user.role)) {
    return { ok: false, message: "No tienes permiso para agregar datos de contacto." };
  }

  const parsed = parseAddContactMethodForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const contact = await prisma.contact.findUnique({
    where: { id: data.contactId },
    select: { id: true, companyId: true },
  });
  if (!contact) return { ok: false, message: "No se encontró el contacto." };

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      let makePrimary = data.makePrimary;

      if (data.type === "EMAIL") {
        const has = await tx.contactMethod.findFirst({
          where: {
            contactId: data.contactId,
            type: "EMAIL",
            isActive: true,
            isPrimary: true,
          },
        });
        if (!has) makePrimary = true;
      } else if (data.type === "PHONE" || data.type === "WHATSAPP") {
        const has = await tx.contactMethod.findFirst({
          where: {
            contactId: data.contactId,
            type: { in: ["PHONE", "WHATSAPP"] },
            isActive: true,
            isPrimary: true,
          },
        });
        if (!has) makePrimary = true;
      }

      if (makePrimary) {
        if (data.type === "EMAIL") {
          await tx.contactMethod.updateMany({
            where: {
              contactId: data.contactId,
              type: "EMAIL",
              isActive: true,
            },
            data: { isPrimary: false },
          });
        } else if (data.type === "PHONE" || data.type === "WHATSAPP") {
          await tx.contactMethod.updateMany({
            where: {
              contactId: data.contactId,
              type: { in: ["PHONE", "WHATSAPP"] },
              isActive: true,
            },
            data: { isPrimary: false },
          });
        } else {
          await tx.contactMethod.updateMany({
            where: {
              contactId: data.contactId,
              type: "LINKEDIN",
              isActive: true,
            },
            data: { isPrimary: false },
          });
        }
      }

      await tx.contactMethod.create({
        data: {
          contactId: data.contactId,
          type: data.type,
          value: data.value,
          label: data.label,
          notes: data.notes,
          isPrimary: makePrimary,
          isActive: true,
          createdById: userId,
        },
      });
    });

    await syncContactPrimaryFields(data.contactId);

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${data.contactId}`);
    revalidatePath(`/companies/${contact.companyId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo guardar. Intenta de nuevo." };
  }
}

export async function setPrimaryContactMethod(methodId: string): Promise<ContactMethodActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Debes iniciar sesión." };
  }
  if (!canManageContactMethodDirectory(session.user.role)) {
    return { ok: false, message: "Solo Director puede cambiar el principal." };
  }

  const method = await prisma.contactMethod.findFirst({
    where: { id: methodId, isActive: true },
    select: { id: true, contactId: true, type: true },
  });
  if (!method) return { ok: false, message: "Dato no encontrado o inactivo." };

  try {
    await prisma.$transaction(async (tx) => {
      if (method.type === "EMAIL") {
        await tx.contactMethod.updateMany({
          where: {
            contactId: method.contactId,
            type: "EMAIL",
            isActive: true,
          },
          data: { isPrimary: false },
        });
      } else if (method.type === "PHONE" || method.type === "WHATSAPP") {
        await tx.contactMethod.updateMany({
          where: {
            contactId: method.contactId,
            type: { in: ["PHONE", "WHATSAPP"] },
            isActive: true,
          },
          data: { isPrimary: false },
        });
      } else {
        await tx.contactMethod.updateMany({
          where: {
            contactId: method.contactId,
            type: "LINKEDIN",
            isActive: true,
          },
          data: { isPrimary: false },
        });
      }

      await tx.contactMethod.update({
        where: { id: method.id },
        data: { isPrimary: true },
      });
    });

    await syncContactPrimaryFields(method.contactId);

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${method.contactId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo actualizar el principal." };
  }
}

export async function deactivateContactMethod(methodId: string): Promise<ContactMethodActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Debes iniciar sesión." };
  }
  if (!canManageContactMethodDirectory(session.user.role)) {
    return { ok: false, message: "Solo Director puede desactivar datos." };
  }

  const method = await prisma.contactMethod.findUnique({
    where: { id: methodId },
    select: { id: true, contactId: true, isActive: true },
  });
  if (!method?.isActive) return { ok: false, message: "Ya estaba inactivo." };

  const contact = await prisma.contact.findUnique({
    where: { id: method.contactId },
    select: { companyId: true },
  });

  try {
    await prisma.contactMethod.update({
      where: { id: methodId },
      data: { isActive: false, isPrimary: false },
    });

    await syncContactPrimaryFields(method.contactId);

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${method.contactId}`);
    if (contact) revalidatePath(`/companies/${contact.companyId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo desactivar." };
  }
}
