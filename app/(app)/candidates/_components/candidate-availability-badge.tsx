import { Badge } from "@/components/ui/badge";
import type { CandidateAvailabilityUi } from "@/lib/candidates/types";

const variantByStatus: Record<
  CandidateAvailabilityUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Disponible: "default",
  "En proceso": "secondary",
  Asignado: "outline",
  "No disponible": "destructive",
};

export function CandidateAvailabilityBadge({
  status,
}: {
  status: CandidateAvailabilityUi;
}) {
  const variant = variantByStatus[status] ?? "outline";
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
