"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  CANDIDATE_RECRUITMENT_STAGE_LABELS,
  CANDIDATE_RECRUITMENT_STAGE_ORDER,
} from "@/lib/candidates/constants";
import { groupCandidatesByRecruitmentStage } from "@/lib/candidates/group-by-recruitment-stage";
import type { CandidateUi } from "@/lib/candidates/types";
import type { CandidateRecruitmentStage } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

import { CandidateListStageSelect } from "./candidate-list-stage-select";

function PipelineCard({
  row,
  canManage,
}: {
  row: CandidateUi;
  canManage: boolean;
}) {
  const router = useRouter();
  const name = row.displayName?.trim() || "Sin nombre";
  const role = row.role?.trim() || "—";
  const availability =
    row.availabilityBadgeLabel?.trim() || row.availabilityStatus || "—";
  const vacancyLine = row.pipelineVacancyLine?.trim();
  const showVacancy = Boolean(vacancyLine && vacancyLine !== "—");

  const go = React.useCallback(() => {
    router.push(`/candidates/${row.id}`);
  }, [router, row.id]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    },
    [go],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-left shadow-sm",
        "cursor-pointer transition-colors hover:bg-muted/40",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
      onClick={go}
      onKeyDown={onKeyDown}
      aria-label={`Ver ${name}`}
    >
      <p className="font-medium leading-snug">{name}</p>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{role}</p>
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
        {availability}
      </p>
      {showVacancy ? (
        <p
          className="mt-1 text-xs text-muted-foreground line-clamp-2"
          title={vacancyLine}
        >
          {vacancyLine}
        </p>
      ) : null}
      {canManage ? (
        <div
          className="mt-3 border-t border-border/60 pt-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <CandidateListStageSelect
            candidateId={row.id}
            value={row.recruitmentStage}
            className="max-w-none w-full"
          />
        </div>
      ) : null}
    </div>
  );
}

function StageColumn({
  stage,
  rows,
  canManage,
}: {
  stage: CandidateRecruitmentStage;
  rows: CandidateUi[];
  canManage: boolean;
}) {
  const label = CANDIDATE_RECRUITMENT_STAGE_LABELS[stage] ?? stage;
  return (
    <div className="flex w-[min(100%,16rem)] shrink-0 flex-col gap-2 sm:w-56">
      <div className="sticky top-0 z-[1] flex items-baseline justify-between gap-2 border-b border-border bg-card pb-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs tabular-nums text-muted-foreground">
          {rows.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 pb-4">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">Vacío</p>
        ) : (
          rows.map((row) => (
            <PipelineCard key={row.id} row={row} canManage={canManage} />
          ))
        )}
      </div>
    </div>
  );
}

export function CandidatesPipelineBoard({
  candidates,
  canManage = false,
}: {
  candidates: CandidateUi[];
  canManage?: boolean;
}) {
  const byStage = React.useMemo(
    () => groupCandidatesByRecruitmentStage(candidates),
    [candidates],
  );

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-h-[12rem] gap-4 pr-2">
        {CANDIDATE_RECRUITMENT_STAGE_ORDER.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            rows={byStage.get(stage) ?? []}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}
