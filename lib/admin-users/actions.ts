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
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, message: "Usuario no encontrado." };
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
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, message: "Usuario no encontrado." };
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
