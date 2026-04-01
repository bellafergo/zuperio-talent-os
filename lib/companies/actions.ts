"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageCompanies } from "@/lib/auth/company-access";
import { prisma } from "@/lib/prisma";

import { parseCompanyForm } from "./validation";

export type CompanyActionState =
  | { ok: true }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string>;
    };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: CompanyActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      state: { ok: false, message: "You must be signed in." },
    };
  }
  if (!canManageCompanies(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "You do not have permission to change companies.",
      },
    };
  }
  return { ok: true };
}

export async function createCompany(
  _prev: CompanyActionState | null,
  formData: FormData,
): Promise<CompanyActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseCompanyForm(formData);
  if (!parsed.ok) {
    return { ok: false, fieldErrors: parsed.fieldErrors };
  }

  const { data } = parsed;
  if (data.ownerId) {
    const user = await prisma.user.findUnique({
      where: { id: data.ownerId },
      select: { id: true },
    });
    if (!user) {
      return {
        ok: false,
        fieldErrors: { ownerId: "Selected owner was not found." },
      };
    }
  }

  try {
    await prisma.company.create({
      data: {
        name: data.name,
        industry: data.industry,
        location: data.location,
        status: data.status,
        ownerId: data.ownerId,
      },
    });
  } catch {
    return {
      ok: false,
      message: "Could not create the company. Try again.",
    };
  }

  revalidatePath("/companies");
  return { ok: true };
}

export async function updateCompany(
  _prev: CompanyActionState | null,
  formData: FormData,
): Promise<CompanyActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("companyId");
  const companyId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!companyId) {
    return { ok: false, message: "Missing company id." };
  }

  const exists = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false, message: "Company was not found." };
  }

  const parsed = parseCompanyForm(formData);
  if (!parsed.ok) {
    return { ok: false, fieldErrors: parsed.fieldErrors };
  }

  const { data } = parsed;
  if (data.ownerId) {
    const user = await prisma.user.findUnique({
      where: { id: data.ownerId },
      select: { id: true },
    });
    if (!user) {
      return {
        ok: false,
        fieldErrors: { ownerId: "Selected owner was not found." },
      };
    }
  }

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        industry: data.industry,
        location: data.location,
        status: data.status,
        ownerId: data.ownerId,
      },
    });
  } catch {
    return {
      ok: false,
      message: "Could not update the company. Try again.",
    };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { ok: true };
}
