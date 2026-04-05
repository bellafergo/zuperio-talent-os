import type {
  ExternalVacancyPublicationStatus,
  JobBoardProvider,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { jobBoardProviderLabel } from "./labels";

export type ExternalPublicationRowUi = {
  id: string;
  provider: JobBoardProvider;
  providerLabel: string;
  externalVacancyRef: string | null;
  status: ExternalVacancyPublicationStatus;
  publishedAt: Date | null;
  lastSyncAt: Date | null;
  lastError: string | null;
};

/**
 * Read path isolated for page stability: failures degrade to an empty list.
 */
export async function listExternalPublicationsForVacancySafe(
  vacancyId: string,
): Promise<ExternalPublicationRowUi[]> {
  try {
    const rows = await prisma.externalVacancyPublication.findMany({
      where: { vacancyId },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      provider: r.provider,
      providerLabel: jobBoardProviderLabel(r.provider),
      externalVacancyRef: r.externalVacancyRef,
      status: r.status,
      publishedAt: r.publishedAt,
      lastSyncAt: r.lastSyncAt,
      lastError: r.lastError,
    }));
  } catch (err) {
    console.error(
      "[job-board] listExternalPublicationsForVacancySafe failed",
      err,
    );
    return [];
  }
}
