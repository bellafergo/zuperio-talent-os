import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";

export const CV_UPLOAD_DIR = path.join(process.cwd(), "uploads", "cv");

export const CV_ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Same limit as `cv-upload` API route. */
export const CV_MAX_BYTES = 10 * 1024 * 1024;

export type CvFileSaveResult = { ok: true } | { ok: false; message: string };

/**
 * Persists an original CV using the same layout as `/api/candidates/[id]/cv-upload`.
 * Caller must enforce auth and permissions.
 */
export async function saveCandidateCvFile(
  candidateId: string,
  file: File,
): Promise<CvFileSaveResult> {
  const id = typeof candidateId === "string" ? candidateId.trim() : "";
  if (!id) return { ok: false, message: "ID de candidato inválido." };

  if (!CV_ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      message: "Tipo de archivo no permitido. Solo PDF, DOC o DOCX.",
    };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, message: "No se pudo leer el archivo." };
  }

  if (buffer.length > CV_MAX_BYTES) {
    return { ok: false, message: "Archivo demasiado grande (máximo 10 MB)." };
  }

  const exists = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false, message: "Candidato no encontrado." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const fileKey = `${id}_${randomUUID()}.${ext}`;

  try {
    await mkdir(CV_UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(CV_UPLOAD_DIR, fileKey), buffer);
    await prisma.candidate.update({
      where: { id },
      data: {
        cvFileName: file.name,
        cvFileKey: fileKey,
        cvUploadedAt: new Date(),
      },
    });
    return { ok: true };
  } catch (err) {
    console.error("[saveCandidateCvFile] failed", err);
    return { ok: false, message: "No se pudo guardar el CV." };
  }
}
