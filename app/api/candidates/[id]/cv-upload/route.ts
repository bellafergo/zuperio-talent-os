import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "cv");
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Solo PDF, DOC o DOCX." },
      { status: 415 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande (máximo 10 MB)." }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const fileKey = `${id}_${randomUUID()}.${ext}`;

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, fileKey), Buffer.from(arrayBuffer));

  // If there was a previous file, we can clean it up later; for now just overwrite the record
  await prisma.candidate.update({
    where: { id },
    data: {
      cvFileName: file.name,
      cvFileKey: fileKey,
      cvUploadedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, cvFileName: file.name });
}
