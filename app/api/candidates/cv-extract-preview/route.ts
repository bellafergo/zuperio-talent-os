import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { parseCvPlainTextForAutofill } from "@/lib/candidates/cv-autofill-from-text";
import type { CvExtractPreviewResponse } from "@/lib/candidates/cv-autofill-types";
import { CV_ALLOWED_MIME, CV_MAX_BYTES } from "@/lib/candidates/cv-file-save";
import { CV_RAW_TEXT_MAX, CV_WORK_EXPERIENCE_FIELD_MAX } from "@/lib/candidates/cv-text-limits";
import { extractTextFromCvBuffer } from "@/lib/candidates/cv-text-extract";
import { readStoredCandidateCvForExtraction } from "@/lib/candidates/read-stored-cv-for-extraction";

export const dynamic = "force-dynamic";

async function extractFromBuffer(
  buffer: Buffer,
  logicalFileName: string,
): Promise<NextResponse> {
  let plain: string | null | undefined;
  const ext = logicalFileName.split(".").pop()?.toLowerCase() ?? "";

  try {
    plain = (await extractTextFromCvBuffer(buffer, logicalFileName)) ?? undefined;
    if (!plain?.trim()) {
      const source = ext === "pdf" ? "empty" : "unsupported";
      const body: CvExtractPreviewResponse = {
        ok: true,
        source,
        suggestions: {},
      };
      return NextResponse.json(body);
    }

    const suggestions = parseCvPlainTextForAutofill(plain);
    console.log("[cv-extract-preview] CV autofill result:", {
      email: suggestions.email ?? null,
      phone: suggestions.phone ?? null,
      skillsLine: suggestions.skillsLine ?? null,
      firstName: suggestions.firstName ?? null,
      lastName: suggestions.lastName ?? null,
      hasRaw: Boolean(suggestions.cvRawText),
    });
    const body: CvExtractPreviewResponse = {
      ok: true,
      source: ext === "pdf" ? "pdf" : "unsupported",
      suggestions,
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[cv-extract-preview] failed", err);
    const cleaned = plain?.replace(/\0/g, " ").trim() ?? "";
    if (cleaned.length >= 20) {
      const capped = cleaned.slice(0, CV_RAW_TEXT_MAX);
      return NextResponse.json({
        ok: true,
        source: "empty",
        suggestions: {
          cvRawText: capped,
          cvWorkExperienceText: capped.slice(0, CV_WORK_EXPERIENCE_FIELD_MAX),
        },
      } satisfies CvExtractPreviewResponse);
    }
    return NextResponse.json(
      {
        ok: true,
        source: "empty",
        suggestions: {},
      } satisfies CvExtractPreviewResponse,
      { status: 200 },
    );
  }
}

/**
 * Stateless CV text extraction + heuristic autofill for create/edit forms.
 * Source: multipart `file`, or `candidateId` to read the candidate's stored CV on disk.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "No autenticado" } satisfies CvExtractPreviewResponse,
      { status: 401 },
    );
  }
  if (!canManageCandidates(session.user.role)) {
    return NextResponse.json(
      { ok: false, error: "Sin permiso" } satisfies CvExtractPreviewResponse,
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud inválida" } satisfies CvExtractPreviewResponse,
      { status: 400 },
    );
  }

  const fileEntry = formData.get("file");
  const hasUploadedFile =
    fileEntry instanceof File && fileEntry.size > 0;

  const candidateIdRaw = formData.get("candidateId");
  const candidateIdFromForm =
    typeof candidateIdRaw === "string" ? candidateIdRaw.trim() : "";

  if (!hasUploadedFile && !candidateIdFromForm) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Adjunta un archivo CV o usa un candidato con CV ya guardado en la ficha.",
      } satisfies CvExtractPreviewResponse,
      { status: 400 },
    );
  }

  let buffer: Buffer;
  let logicalName: string;

  if (hasUploadedFile) {
    const file = fileEntry as File;
    if (!CV_ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tipo no permitido para vista previa (PDF, DOC, DOCX).",
        } satisfies CvExtractPreviewResponse,
        { status: 415 },
      );
    }
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch {
      return NextResponse.json(
        { ok: false, error: "No se pudo leer el archivo" } satisfies CvExtractPreviewResponse,
        { status: 400 },
      );
    }
    logicalName = file.name || "cv.pdf";
  } else {
    const stored = await readStoredCandidateCvForExtraction(candidateIdFromForm);
    if (!stored.ok) {
      const msg =
        stored.reason === "missing_disk"
          ? "El CV guardado no está en disco. Sube el archivo de nuevo."
          : stored.reason === "no_record"
            ? "Este candidato no tiene CV original guardado. Sube un archivo primero."
            : stored.reason === "too_large"
              ? "El CV guardado supera el tamaño máximo permitido."
              : "No se pudo leer el CV guardado.";
      return NextResponse.json(
        { ok: false, error: msg } satisfies CvExtractPreviewResponse,
        { status: stored.reason === "no_record" ? 404 : 400 },
      );
    }
    buffer = stored.buffer;
    logicalName = stored.fileName;
  }

  if (buffer.length > CV_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Archivo demasiado grande (máx. 10 MB)" } satisfies CvExtractPreviewResponse,
      { status: 413 },
    );
  }

  return extractFromBuffer(buffer, logicalName);
}
