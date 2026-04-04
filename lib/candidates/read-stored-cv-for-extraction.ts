import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

import { CV_MAX_BYTES, CV_UPLOAD_DIR } from "@/lib/candidates/cv-file-save";
import { prisma } from "@/lib/prisma";

export type StoredCvReadResult =
  | { ok: true; buffer: Buffer; fileName: string }
  | {
      ok: false;
      reason: "invalid_id" | "no_record" | "missing_disk" | "too_large" | "db_error";
    };

/**
 * Loads the persisted original CV from disk for server-side text extraction.
 * Same layout as `/api/candidates/[id]/cv-upload` and `cv-file` GET.
 */
export async function readStoredCandidateCvForExtraction(
  candidateId: string,
): Promise<StoredCvReadResult> {
  const id = typeof candidateId === "string" ? candidateId.trim() : "";
  if (!id) return { ok: false, reason: "invalid_id" };

  try {
    const row = await prisma.candidate.findUnique({
      where: { id },
      select: { cvFileKey: true, cvFileName: true },
    });

    if (!row?.cvFileKey || !row.cvFileName?.trim()) {
      return { ok: false, reason: "no_record" };
    }

    const filePath = path.join(CV_UPLOAD_DIR, row.cvFileKey);
    if (!existsSync(filePath)) {
      return { ok: false, reason: "missing_disk" };
    }

    const buffer = await readFile(filePath);
    if (buffer.length > CV_MAX_BYTES) {
      return { ok: false, reason: "too_large" };
    }

    return { ok: true, buffer, fileName: row.cvFileName };
  } catch (err) {
    console.error("[readStoredCandidateCvForExtraction]", err);
    return { ok: false, reason: "db_error" };
  }
}
