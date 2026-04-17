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
  label,
}: {
  status: CandidateAvailabilityUi;
  /** When set, shown instead of the coarse filter bucket (e.g. “Disponible inmediata”). */
  label?: string;
}) {
  const variant = variantByStatus[status] ?? "outline";
  const text = label ?? status;
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {text}
    </Badge>
  );
}
