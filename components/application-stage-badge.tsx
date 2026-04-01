import { Badge } from "@/components/ui/badge";
import type { VacancyApplicationStageUi } from "@/lib/vacancy-applications/types";

const variantByStage: Record<
  VacancyApplicationStageUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Nueva: "outline",
  "Pre-filtro": "secondary",
  "Entrevista interna": "secondary",
  "Entrevista cliente": "default",
  Oferta: "default",
  Contratado: "default",
  Rechazado: "destructive",
  Retirado: "outline",
};

export function ApplicationStageBadge({ stage }: { stage: VacancyApplicationStageUi }) {
  return (
    <Badge variant={variantByStage[stage]} className="whitespace-nowrap font-normal">
      {stage}
    </Badge>
  );
}
