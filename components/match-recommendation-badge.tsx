import { Badge } from "@/components/ui/badge";
import type { MatchRecommendationUi } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

const styles: Record<MatchRecommendationUi, string> = {
  "Match alto":
    "border-emerald-600/40 bg-emerald-50 text-emerald-950 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-50",
  "Match medio":
    "border-amber-600/40 bg-amber-50 text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/40 dark:text-amber-50",
  "Match bajo":
    "border-rose-600/40 bg-rose-50 text-rose-950 dark:border-rose-500/35 dark:bg-rose-950/40 dark:text-rose-50",
};

export function MatchRecommendationBadge({
  recommendation,
}: {
  recommendation: MatchRecommendationUi;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap font-semibold", styles[recommendation])}
    >
      {recommendation}
    </Badge>
  );
}
