import type { CandidateAvailabilityStatus } from "@/generated/prisma/enums";

const LABELS: Record<CandidateAvailabilityStatus, string> = {
  AVAILABLE: "Disponible",
  IN_PROCESS: "En proceso",
  ASSIGNED: "Asignado",
  NOT_AVAILABLE: "No disponible",
};

export function candidateAvailabilityLabel(s: CandidateAvailabilityStatus): string {
  return LABELS[s] ?? s;
}
