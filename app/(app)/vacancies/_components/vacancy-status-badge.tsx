import { Badge } from "@/components/ui/badge";
import type { VacancyStatusUi } from "@/lib/vacancies/types";

const variantByStatus: Record<
  VacancyStatusUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Draft: "outline",
  Open: "default",
  "On hold": "secondary",
  Sourcing: "outline",
  Interviewing: "default",
  Filled: "secondary",
  Cancelled: "destructive",
};

export function VacancyStatusBadge({ status }: { status: VacancyStatusUi }) {
  return (
    <Badge variant={variantByStatus[status]} className="whitespace-nowrap">
      {status}
    </Badge>
  );
}
