"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { updateCandidateRecruitmentStage } from "@/lib/candidates/actions";
import {
  CANDIDATE_RECRUITMENT_STAGE_LABELS,
  CANDIDATE_RECRUITMENT_STAGE_ORDER,
} from "@/lib/candidates/constants";
import type { CandidateRecruitmentStage } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 max-w-[11rem] min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-1 text-xs transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "dark:bg-input/30",
);

const SUCCESS_MS = 2800;
const ERROR_MS = 8000;

export function CandidateListStageSelect({
  candidateId,
  value,
  className,
}: {
  candidateId: string;
  value: CandidateRecruitmentStage;
  /** e.g. full width inside pipeline cards */
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    | { kind: "success"; text: string }
    | { kind: "error"; text: string }
    | null
  >(null);

  useEffect(() => {
    if (!feedback) return;
    const ms = feedback.kind === "success" ? SUCCESS_MS : ERROR_MS;
    const t = window.setTimeout(() => setFeedback(null), ms);
    return () => window.clearTimeout(t);
  }, [feedback]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <select
          className={cn(selectClass, className)}
          value={value}
          disabled={pending}
          aria-busy={pending}
          aria-label="Etapa del proceso"
          title={pending ? "Guardando cambio…" : undefined}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const next = e.target.value as CandidateRecruitmentStage;
            if (next === value) return;
            setFeedback(null);
            startTransition(async () => {
              const res = await updateCandidateRecruitmentStage(
                candidateId,
                next,
              );
              if (res.ok) {
                setFeedback({
                  kind: "success",
                  text: "Etapa actualizada.",
                });
                router.refresh();
              } else {
                setFeedback({
                  kind: "error",
                  text: res.message ?? "No se pudo guardar la etapa.",
                });
              }
            });
          }}
        >
          {CANDIDATE_RECRUITMENT_STAGE_ORDER.map((v) => (
            <option key={v} value={v}>
              {CANDIDATE_RECRUITMENT_STAGE_LABELS[v]}
            </option>
          ))}
        </select>
        {pending ? (
          <Loader2Icon
            className="size-3.5 shrink-0 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
      {feedback ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-[11px] leading-snug",
            feedback.kind === "success"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
