import { TonalBadge } from "@/components/layout";
import type { OpportunityStageUi } from "@/lib/opportunities/types";

const toneByStage: Record<
  OpportunityStageUi,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  Prospección: "neutral",
  Calificación: "info",
  Propuesta: "info",
  Negociación: "warning",
  "Cerrada ganada": "success",
  "Cerrada perdida": "danger",
};

export function OpportunityStageBadge({ stage }: { stage: OpportunityStageUi }) {
  return (
    <TonalBadge tone={toneByStage[stage]} className="whitespace-nowrap">
      {stage}
    </TonalBadge>
  );
}
