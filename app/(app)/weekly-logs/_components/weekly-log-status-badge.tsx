import { Badge } from "@/components/ui/badge";
import type { WeeklyLogStatusUi } from "@/lib/weekly-logs/types";

const variantByStatus: Record<
  WeeklyLogStatusUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Draft: "outline",
  Submitted: "secondary",
  Approved: "default",
  Returned: "destructive",
};

export function WeeklyLogStatusBadge({ status }: { status: WeeklyLogStatusUi }) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}

