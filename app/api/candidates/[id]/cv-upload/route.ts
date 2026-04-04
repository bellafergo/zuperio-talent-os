import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { prisma } from "@/lib/prisma";
import { saveCandidateCvFile } from "@/lib/candidates/cv-file-save";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!canManageCandidates(session.user.role)) {
    return NextResponse.json({ error: "Sin permiso para subir CV" }, { status: 403 });
  }

  const { id } = await context.params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true, cvFileKey: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' requerido" }, { status: 400 });
  }

  const saved = await saveCandidateCvFile(id, file);
  if (!saved.ok) {
    const status =
      saved.message.includes("Tipo") || saved.message.includes("tipo")
        ? 415
        : saved.message.includes("grande")
          ? 413
          : 400;
    return NextResponse.json({ error: saved.message }, { status });
  }

  return NextResponse.json({ ok: true, cvFileName: file.name });
}
