import type { JobBoardProvider } from "@/generated/prisma/enums";

/**
 * Contract for a future live integration (OCC, Computrabajo, etc.).
 * V1: only the manual adapter records intent in DB without outbound HTTP.
 */
export type JobBoardPublishIntent = {
  vacancyId: string;
  externalVacancyRef?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type JobBoardPublishResult = {
  ok: boolean;
  externalVacancyRef?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
};

export interface JobBoardAdapter {
  readonly provider: JobBoardProvider;

  /**
   * Attempt to publish or register publication intent. Implementations must not throw
   * for expected provider errors — return { ok: false, errorMessage } instead.
   */
  publishVacancy(intent: JobBoardPublishIntent): Promise<JobBoardPublishResult>;
}
