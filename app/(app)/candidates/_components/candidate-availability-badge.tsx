import { Badge } from "@/components/ui/badge";
import type { CandidateAvailabilityUi } from "@/lib/candidates/types";

const variantByStatus: Record<
  CandidateAvailabilityUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Available: "default",
  "In process": "secondary",
  Assigned: "outline",
  "Not available": "destructive",
};

export function CandidateAvailabilityBadge({
  status,
}: {
  status: CandidateAvailabilityUi;
}) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
