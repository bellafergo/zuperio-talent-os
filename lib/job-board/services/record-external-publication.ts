import type {
  ExternalVacancyPublicationStatus,
  JobBoardProvider,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import type { JobBoardAdapter, JobBoardPublishIntent } from "../adapters/types";

export type RecordPublicationInput = JobBoardPublishIntent & {
  adapter: JobBoardAdapter;
  initialStatus?: ExternalVacancyPublicationStatus;
};

/**
 * Persists publication tracking and invokes the adapter (in-process only in v1).
 * Adapter failures are stored as FAILED rows; unexpected errors should be caught by callers for UI stability.
 */
export async function recordExternalVacancyPublication(
  input: RecordPublicationInput,
): Promise<{ publicationId: string }> {
  const { adapter, initialStatus = "PENDING", ...intent } = input;

  let result;
  try {
    result = await adapter.publishVacancy(intent);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const row = await prisma.externalVacancyPublication.create({
      data: {
        vacancyId: intent.vacancyId,
        provider: adapter.provider,
        externalVacancyRef: intent.externalVacancyRef ?? null,
        status: "FAILED",
        lastError: msg,
        metadata: (intent.metadata as object | undefined) ?? undefined,
      },
    });
    return { publicationId: row.id };
  }

  const status: ExternalVacancyPublicationStatus = !result.ok
    ? "FAILED"
    : initialStatus === "DRAFT"
      ? "DRAFT"
      : "PUBLISHED";

  const row = await prisma.externalVacancyPublication.create({
    data: {
      vacancyId: intent.vacancyId,
      provider: adapter.provider,
      externalVacancyRef:
        result.externalVacancyRef ?? intent.externalVacancyRef ?? null,
      status,
      publishedAt: result.ok ? new Date() : null,
      lastSyncAt: result.ok ? new Date() : null,
      metadata:
        (result.metadata as object | undefined) ??
        (intent.metadata as object | undefined),
      lastError: result.ok ? null : result.errorMessage ?? "Publication failed",
    },
  });

  return { publicationId: row.id };
}
