import { Badge } from "@/components/ui/badge";
import type { PlacementStatusUi } from "@/lib/placements/types";

const variantByStatus: Record<
  PlacementStatusUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Active: "default",
  Completed: "secondary",
  Cancelled: "outline",
};

export function PlacementStatusBadge({ status }: { status: PlacementStatusUi }) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
