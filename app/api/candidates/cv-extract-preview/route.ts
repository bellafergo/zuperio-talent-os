import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { parseCvPlainTextForAutofill } from "@/lib/candidates/cv-autofill-from-text";
import type { CvExtractPreviewResponse } from "@/lib/candidates/cv-autofill-types";
import { CV_ALLOWED_MIME, CV_MAX_BYTES } from "@/lib/candidates/cv-file-save";
import { extractTextFromCvBuffer } from "@/lib/candidates/cv-text-extract";

export const dynamic = "force-dynamic";

/**
 * Stateless CV text extraction + heuristic autofill for create/edit forms.
 * Does not persist files or touch the database.
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

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Campo 'file' requerido" } satisfies CvExtractPreviewResponse,
      { status: 400 },
    );
  }

  if (!CV_ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Tipo no permitido para vista previa (PDF, DOC, DOCX).",
      } satisfies CvExtractPreviewResponse,
      { status: 415 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo leer el archivo" } satisfies CvExtractPreviewResponse,
      { status: 400 },
    );
  }

  if (buffer.length > CV_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Archivo demasiado grande (máx. 10 MB)" } satisfies CvExtractPreviewResponse,
      { status: 413 },
    );
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const plain = await extractTextFromCvBuffer(buffer, file.name);
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
    });
    const body: CvExtractPreviewResponse = {
      ok: true,
      source: ext === "pdf" ? "pdf" : "unsupported",
      suggestions,
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[cv-extract-preview] failed", err);
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
