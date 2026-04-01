import type { CandidateAvailabilityStatus } from "@/generated/prisma/enums";

const LABELS: Record<CandidateAvailabilityStatus, string> = {
  AVAILABLE: "Available",
  IN_PROCESS: "In process",
  ASSIGNED: "Assigned",
  NOT_AVAILABLE: "Not available",
};

export function candidateAvailabilityLabel(s: CandidateAvailabilityStatus): string {
  return LABELS[s] ?? s;
}
