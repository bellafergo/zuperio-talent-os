import { unlink } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";

import { NextResponse } from "next/server";
import { Readable } from "stream";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "cv");

function extToMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

/** GET /api/candidates/[id]/cv-file — download the original CV file (RECRUITER | DIRECTOR). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!canManageCandidates(session.user.role)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { id } = await context.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { cvFileKey: true, cvFileName: true },
  });

  if (!candidate?.cvFileKey || !candidate.cvFileName) {
    return NextResponse.json({ error: "No hay CV original subido" }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, candidate.cvFileKey);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 });
  }

  const mime = extToMime(candidate.cvFileKey);
  const encodedName = encodeURIComponent(candidate.cvFileName);

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${candidate.cvFileName}"; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "no-store",
    },
  });
}

/** DELETE /api/candidates/[id]/cv-file — remove the CV file (DIRECTOR only). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "DIRECTOR") {
    return NextResponse.json({ error: "Solo DIRECTOR puede eliminar el CV" }, { status: 403 });
  }

  const { id } = await context.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { cvFileKey: true },
  });

  if (!candidate?.cvFileKey) {
    return NextResponse.json({ error: "No hay CV subido" }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, candidate.cvFileKey);
  try {
    await unlink(filePath);
  } catch {
    // File may already be missing from disk; continue to clear DB record
  }

  await prisma.candidate.update({
    where: { id },
    data: { cvFileName: null, cvFileKey: null, cvUploadedAt: null },
  });

  return NextResponse.json({ ok: true });
}
