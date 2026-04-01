import { Badge } from "@/components/ui/badge";
import type { VacancyApplicationStageUi } from "@/lib/vacancy-applications/types";

const variantByStage: Record<
  VacancyApplicationStageUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  New: "outline",
  "Pre-screen": "secondary",
  "Internal interview": "secondary",
  "Client interview": "default",
  Offer: "default",
  Hired: "default",
  Rejected: "destructive",
  Withdrawn: "outline",
};

export function ApplicationStageBadge({ stage }: { stage: VacancyApplicationStageUi }) {
  return (
    <Badge variant={variantByStage[stage]} className="whitespace-nowrap font-normal">
      {stage}
    </Badge>
  );
}
