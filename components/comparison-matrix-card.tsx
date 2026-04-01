import { MatchRecommendationBadge } from "@/components/match-recommendation-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonRowMatchLevel } from "@/lib/matching/comparison-matrix";
import { mapMatchRecommendationToUi } from "@/lib/matching/mappers";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<ComparisonRowMatchLevel, string> = {
  MET: "Met",
  PARTIAL: "Partial",
  GAP: "Gap",
  OPEN: "Open",
};

function MatchLevelBadge({ level }: { level: ComparisonRowMatchLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-normal",
        level === "MET" &&
          "border-emerald-600/35 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/35 dark:text-emerald-50",
        level === "PARTIAL" &&
          "border-amber-600/35 bg-amber-50/90 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/35 dark:text-amber-50",
        level === "GAP" &&
          "border-rose-600/35 bg-rose-50/90 text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/35 dark:text-rose-50",
        level === "OPEN" &&
          "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );
}

export function ComparisonMatrixCard({
  bundle,
  className,
}: {
  bundle: ComparisonMatrixBundle;
  className?: string;
}) {
  const { rows, computedMatch, candidateName, vacancyTitle, companyName } =
    bundle;

  return (
    <Card
      className={cn(
        "shadow-sm ring-1 ring-foreground/5 print:shadow-none print:border-border print:ring-0",
        className,
      )}
    >
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Candidate vs vacancy matrix
            </CardTitle>
            <CardDescription className="text-pretty">
              {candidateName} · {vacancyTitle} ({companyName}). Same structured
              inputs as the match score — deterministic, no AI.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="tabular-nums text-sm font-medium text-foreground">
              Score {computedMatch.score}
            </span>
            <MatchRecommendationBadge
              recommendation={mapMatchRecommendationToUi(
                computedMatch.recommendation,
              )}
            />
          </div>
        </div>
        <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
          {computedMatch.explanation}
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Requirement</TableHead>
              <TableHead className="min-w-[160px]">Candidate</TableHead>
              <TableHead className="w-[100px]">Match</TableHead>
              <TableHead className="w-[88px] text-right">Points</TableHead>
              <TableHead className="min-w-[220px]">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="align-top text-sm text-foreground">
                  {r.requirement}
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">
                  {r.candidateValue}
                </TableCell>
                <TableCell className="align-top">
                  <MatchLevelBadge level={r.matchLevel} />
                </TableCell>
                <TableCell className="align-top text-right tabular-nums text-sm text-muted-foreground">
                  {r.pointsLabel ?? "—"}
                </TableCell>
                <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                  {r.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
