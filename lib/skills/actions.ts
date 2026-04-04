"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageSkills } from "@/lib/auth/skill-access";
import { prisma } from "@/lib/prisma";

import { SKILL_CATEGORIES } from "./constants";

export type SkillActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

export async function createSkill(
  _prev: SkillActionState | null,
  formData: FormData,
): Promise<SkillActionState> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, message: "No autenticado." };
  }
  if (!canManageSkills(session.user.role)) {
    return { ok: false, message: "Solo Dirección puede agregar skills al catálogo." };
  }

  const name = ((formData.get("name") as string) ?? "").trim();
  const categoryRaw = ((formData.get("category") as string) ?? "").trim();
  const category = (SKILL_CATEGORIES as readonly string[]).includes(categoryRaw)
    ? categoryRaw
    : null;

  if (!name) {
    return { ok: false, fieldErrors: { name: "El nombre es requerido." } };
  }
  if (name.length > 200) {
    return { ok: false, fieldErrors: { name: "Máximo 200 caracteres." } };
  }

  try {
    const existing = await prisma.skill.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, fieldErrors: { name: "Ya existe un skill con ese nombre en el catálogo." } };
    }

    await prisma.skill.create({ data: { name, category } });

    revalidatePath("/skills");
    return { ok: true };
  } catch (err) {
    console.error("[createSkill] unexpected error:", err);
    return { ok: false, message: "No se pudo crear el skill. Intenta de nuevo." };
  }
}
