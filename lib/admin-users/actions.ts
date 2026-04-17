"use server";

import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { canManageUsers } from "@/lib/auth/user-admin-access";
import { prisma } from "@/lib/prisma";

import type { AdminUserActionState } from "./types";
import {
  parseCreateAdminUserForm,
  parseUpdateAdminUserForm,
} from "./validation";

async function ensureDirector(): Promise<
  { ok: true; actorId: string } | { ok: false; state: AdminUserActionState }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, state: { ok: false, message: "Debes iniciar sesión." } };
  }
  if (!canManageUsers(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "Solo un director puede gestionar usuarios." },
    };
  }
  return { ok: true, actorId: session.user.id };
}

export async function createAdminUser(
  _prev: AdminUserActionState | null,
  formData: FormData,
): Promise<AdminUserActionState> {
  const gate = await ensureDirector();
  if (!gate.ok) return gate.state;

  const parsed = parseCreateAdminUserForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        isActive: true,
        isDeleted: false,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return {
        ok: false,
        fieldErrors: { email: "Ya existe un usuario con este correo." },
      };
    }
    return { ok: false, message: "No se pudo crear el usuario. Intenta de nuevo." };
  }
}

export async function updateAdminUser(
  _prev: AdminUserActionState | null,
  formData: FormData,
): Promise<AdminUserActionState> {
  const gate = await ensureDirector();
  if (!gate.ok) return gate.state;

  const parsed = parseUpdateAdminUserForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  if (data.userId === gate.actorId) {
    if (!data.isActive) {
      return {
        ok: false,
        message: "No puedes desactivar tu propia cuenta.",
      };
    }
    if (data.role !== "DIRECTOR") {
      return {
        ok: false,
        message: "No puedes cambiar tu propio rol de Director.",
      };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, isDeleted: true },
  });
  if (!existing) {
    return { ok: false, message: "Usuario no encontrado." };
  }
  if (existing.isDeleted) {
    return { ok: false, message: "No se puede editar un usuario dado de baja administrativa." };
  }

  try {
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return {
        ok: false,
        fieldErrors: { email: "Ya existe un usuario con este correo." },
      };
    }
    return { ok: false, message: "No se pudo actualizar el usuario." };
  }
}

export async function setAdminUserActive(
  userId: string,
  isActive: boolean,
): Promise<AdminUserActionState> {
  const gate = await ensureDirector();
  if (!gate.ok) return gate.state;

  if (userId === gate.actorId && !isActive) {
    return { ok: false, message: "No puedes desactivar tu propia cuenta." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isDeleted: true },
  });
  if (!existing) {
    return { ok: false, message: "Usuario no encontrado." };
  }
  if (existing.isDeleted) {
    return { ok: false, message: "Un usuario eliminado administrativamente no puede reactivarse aquí." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo actualizar el estado." };
  }
}

/**
 * Director A requests administrative removal (second director must approve).
 * Does not remove access until approval; does not hard-delete the row.
 */
export async function requestAdminUserDeletion(
  userId: string,
): Promise<AdminUserActionState> {
  const gate = await ensureDirector();
  if (!gate.ok) return gate.state;

  if (userId === gate.actorId) {
    return { ok: false, message: "No puedes solicitar la baja de tu propia cuenta." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isDeleted: true,
      deletionRequestedAt: true,
      deletionApprovedAt: true,
    },
  });
  if (!target) {
    return { ok: false, message: "Usuario no encontrado." };
  }
  if (target.isDeleted) {
    return { ok: false, message: "Este usuario ya está dado de baja administrativa." };
  }
  const pending =
    target.deletionRequestedAt != null && target.deletionApprovedAt == null;
  if (pending) {
    return { ok: false, message: "Ya hay una solicitud de baja pendiente de aprobación." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: new Date(),
        deletionRequestedById: gate.actorId,
        deletionApprovedAt: null,
        deletionApprovedById: null,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo registrar la solicitud." };
  }
}

/**
 * Director B approves removal (must differ from requester). Sets soft-delete + inactive.
 */
export async function approveAdminUserDeletion(
  userId: string,
): Promise<AdminUserActionState> {
  const gate = await ensureDirector();
  if (!gate.ok) return gate.state;

  if (userId === gate.actorId) {
    return { ok: false, message: "No puedes aprobar una baja sobre tu propia cuenta." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isDeleted: true,
      deletionRequestedAt: true,
      deletionRequestedById: true,
      deletionApprovedAt: true,
    },
  });
  if (!target) {
    return { ok: false, message: "Usuario no encontrado." };
  }
  if (target.isDeleted) {
    return { ok: false, message: "Este usuario ya está dado de baja." };
  }
  if (!target.deletionRequestedAt || target.deletionApprovedAt) {
    return { ok: false, message: "No hay una solicitud de baja pendiente para este usuario." };
  }
  if (target.deletionRequestedById === gate.actorId) {
    return {
      ok: false,
      message: "No puedes aprobar una solicitud que tú mismo iniciaste. Debe hacerlo otro director.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionApprovedAt: new Date(),
        deletionApprovedById: gate.actorId,
        isDeleted: true,
        isActive: false,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo completar la aprobación." };
  }
}
