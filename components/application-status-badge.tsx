import { Badge } from "@/components/ui/badge";
import type { VacancyApplicationStatusUi } from "@/lib/vacancy-applications/types";

const variantByStatus: Record<
  VacancyApplicationStatusUi,
  "default" | "secondary" | "outline"
> = {
  Activa: "default",
  Cerrada: "secondary",
};

export function ApplicationStatusBadge({
  status,
}: {
  status: VacancyApplicationStatusUi;
}) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
