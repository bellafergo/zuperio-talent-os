import { MatchRecommendationBadge } from "@/components/match-recommendation-badge";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
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
import type { MatchRecommendationUi } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<ComparisonRowMatchLevel, string> = {
  MET: "✔ Cumple",
  PARTIAL: "◐ Parcial",
  GAP: "✖ Falta",
  OPEN: "—",
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

function ScoreCluster({
  score,
  recommendation,
  size = "default",
}: {
  score: number;
  recommendation: MatchRecommendationUi;
  size?: "default" | "hero";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 sm:items-end",
        size === "hero" && "sm:min-w-[200px]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border/90 bg-muted/35 px-3 py-2 ring-1 ring-foreground/[0.04] sm:justify-end sm:px-4 sm:py-2.5",
          size === "hero" && "bg-gradient-to-br from-muted/60 to-muted/25",
        )}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Cobertura
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums tracking-tight text-foreground",
            size === "hero" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {score}%
        </span>
      </div>
      <div className="flex justify-end">
        <MatchRecommendationBadge recommendation={recommendation} />
      </div>
    </div>
  );
}

export function ComparisonMatrixCard({
  bundle,
  className,
  /** `focus` — larger score, tuned for full-page compare. */
  layout = "default",
}: {
  bundle: ComparisonMatrixBundle;
  className?: string;
  layout?: "default" | "focus";
}) {
  const {
    rows,
    computedMatch,
    candidateName,
    vacancyTitle,
    companyName,
    skillMatchActive,
    skillBreakdown,
  } = bundle;

  const recommendationUi = mapMatchRecommendationToUi(
    computedMatch.recommendation,
  );

  const title =
    layout === "focus"
      ? "Detalle de match (skills)"
      : "Matriz candidato vs vacante";

  const description =
    layout === "focus" ? (
      <span className="text-pretty">
        <span className="font-medium text-foreground">{candidateName}</span>
        <span className="text-muted-foreground"> · </span>
        <span>{vacancyTitle}</span>
        <span className="text-muted-foreground"> · </span>
        <span>{companyName}</span>
      </span>
    ) : (
      <span className="text-pretty">
        {candidateName} · {vacancyTitle} ({companyName}). Puntaje = cobertura de
        skills requeridos; contexto de senioridad y disponibilidad no suma al %.
      </span>
    );

  return (
    <SectionCard
      className={cn(
        "print:shadow-none print:ring-0",
        layout === "focus" && "ring-1 ring-foreground/[0.07]",
        className,
      )}
      title={title}
      description={description}
      headerAction={
        skillMatchActive ? (
          <ScoreCluster
            score={computedMatch.score}
            recommendation={recommendationUi}
            size={layout === "focus" ? "hero" : "default"}
          />
        ) : (
          <div className="max-w-[220px] rounded-xl border border-dashed border-border bg-muted/25 px-3 py-2 text-right text-xs leading-snug text-muted-foreground">
            Sin skills marcados como requeridos en la vacante: no hay % de
            cobertura.
          </div>
        )
      }
      contentClassName={cn("space-y-4", layout === "focus" && "pt-5")}
    >
      <div
        className={cn(
          "rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
          layout === "focus" && "border-border/80 bg-muted/25 text-sm",
        )}
      >
        {computedMatch.explanation}
      </div>

      {skillBreakdown ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-600/20 bg-emerald-50/40 px-3 py-3 dark:bg-emerald-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
              Skills requeridos cubiertos ({skillBreakdown.met.length})
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {skillBreakdown.met.length === 0 ? (
                <li className="text-muted-foreground">—</li>
              ) : (
                skillBreakdown.met.map((s) => (
                  <li key={s.skillId}>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      ✔
                    </span>{" "}
                    {s.skillName}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-rose-600/20 bg-rose-50/40 px-3 py-3 dark:bg-rose-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-900 dark:text-rose-100">
              Skills requeridos que faltan ({skillBreakdown.missing.length})
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {skillBreakdown.missing.length === 0 ? (
                <li className="text-muted-foreground">—</li>
              ) : (
                skillBreakdown.missing.map((s) => (
                  <li key={s.skillId}>
                    <span className="text-rose-700 dark:text-rose-400">✖</span>{" "}
                    {s.skillName}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="sm:col-span-2 rounded-lg border border-border/60 bg-card px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Skills en perfil del candidato ({skillBreakdown.candidateSkillNames.length})
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {skillBreakdown.candidateSkillNames.length === 0
                ? "—"
                : skillBreakdown.candidateSkillNames.join(" · ")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Requisito</TableHead>
              <TableHead className="min-w-[160px]">Perfil candidato</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="min-w-[200px]">Nota</TableHead>
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
                <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                  {r.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}
