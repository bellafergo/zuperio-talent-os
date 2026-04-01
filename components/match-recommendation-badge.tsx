import { Badge } from "@/components/ui/badge";
import type { MatchRecommendationUi } from "@/lib/matching/types";

const variantByRecommendation: Record<
  MatchRecommendationUi,
  "default" | "secondary" | "outline"
> = {
  "Strong match": "default",
  "Partial match": "secondary",
  "Low match": "outline",
};

export function MatchRecommendationBadge({
  recommendation,
}: {
  recommendation: MatchRecommendationUi;
}) {
  return (
    <Badge
      variant={variantByRecommendation[recommendation]}
      className="whitespace-nowrap"
    >
      {recommendation}
    </Badge>
  );
}
