import type { JobBoardProvider } from "@/generated/prisma/enums";

import type { JobBoardAdapter, JobBoardPublishIntent, JobBoardPublishResult } from "./types";

/**
 * No outbound calls: marks publication as recorded for testing and future workflows.
 */
export function createManualJobBoardAdapter(): JobBoardAdapter {
  return {
    provider: "MANUAL" as JobBoardProvider,

    async publishVacancy(intent: JobBoardPublishIntent): Promise<JobBoardPublishResult> {
      return {
        ok: true,
        externalVacancyRef: intent.externalVacancyRef ?? `manual-${intent.vacancyId.slice(0, 8)}`,
        metadata: {
          ...(intent.metadata ?? {}),
          recordedByAdapter: "manual",
          recordedAt: new Date().toISOString(),
        },
      };
    },
  };
}
