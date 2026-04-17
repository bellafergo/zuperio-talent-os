import type { PlacementStatus } from "@/generated/prisma/enums";

const LABELS: Record<PlacementStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function placementStatusLabel(s: PlacementStatus): string {
  return LABELS[s] ?? s;
}
