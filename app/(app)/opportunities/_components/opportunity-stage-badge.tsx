import { TonalBadge } from "@/components/layout";
import type { OpportunityStageUi } from "@/lib/opportunities/types";

const toneByStage: Record<
  OpportunityStageUi,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  Prospecting: "neutral",
  Qualification: "info",
  Proposal: "info",
  Negotiation: "warning",
  "Closed won": "success",
  "Closed lost": "danger",
};

export function OpportunityStageBadge({ stage }: { stage: OpportunityStageUi }) {
  return (
    <TonalBadge tone={toneByStage[stage]} className="whitespace-nowrap">
      {stage}
    </TonalBadge>
  );
}
