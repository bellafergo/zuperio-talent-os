import type { JobBoardProvider } from "@/generated/prisma/enums";

const LABELS: Record<JobBoardProvider, string> = {
  OCC: "OCC",
  COMPUTRABAJO: "Computrabajo",
  LINKEDIN: "LinkedIn",
  MANUAL: "Manual / prueba",
  OTHER: "Otro",
};

export function jobBoardProviderLabel(p: JobBoardProvider): string {
  return LABELS[p] ?? p;
}
