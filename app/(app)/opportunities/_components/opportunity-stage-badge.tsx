import { Badge } from "@/components/ui/badge";
import type { OpportunityStageUi } from "@/lib/opportunities/types";

const variantByStage: Record<
  OpportunityStageUi,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Prospecting: "outline",
  Qualification: "secondary",
  Proposal: "default",
  Negotiation: "default",
  "Closed won": "secondary",
  "Closed lost": "destructive",
};

export function OpportunityStageBadge({ stage }: { stage: OpportunityStageUi }) {
  return (
    <Badge variant={variantByStage[stage]} className="whitespace-nowrap">
      {stage}
    </Badge>
  );
}
