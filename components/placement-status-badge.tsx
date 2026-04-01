import { TonalBadge } from "@/components/layout";
import type { PlacementStatusUi } from "@/lib/placements/types";

const toneByStatus: Record<PlacementStatusUi, "success" | "neutral" | "warning"> =
  {
    Active: "success",
    Completed: "neutral",
    Cancelled: "warning",
  };

export function PlacementStatusBadge({ status }: { status: PlacementStatusUi }) {
  return (
    <TonalBadge tone={toneByStatus[status]} className="whitespace-nowrap">
      {status}
    </TonalBadge>
  );
}
