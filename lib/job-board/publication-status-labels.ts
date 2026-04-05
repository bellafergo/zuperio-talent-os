import type { ExternalVacancyPublicationStatus } from "@/generated/prisma/enums";

const LABELS: Record<ExternalVacancyPublicationStatus, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  PUBLISHED: "Publicada",
  SYNCING: "Sincronizando",
  PAUSED: "Pausada",
  FAILED: "Error",
  REMOVED: "Retirada",
};

export function externalPublicationStatusLabel(
  s: ExternalVacancyPublicationStatus,
): string {
  return LABELS[s] ?? s;
}
