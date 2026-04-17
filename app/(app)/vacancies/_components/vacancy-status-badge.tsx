import { Badge } from "@/components/ui/badge";
import type { VacancyStatusUi } from "@/lib/vacancies/types";

const variantByStatus: Record<
  VacancyStatusUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Borrador: "outline",
  Abierta: "default",
  "En pausa": "secondary",
  Sourcing: "outline",
  "En entrevistas": "default",
  Cubiertas: "secondary",
  Cancelada: "destructive",
};

export function VacancyStatusBadge({ status }: { status: VacancyStatusUi }) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
