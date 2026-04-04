"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateCandidateRecruitmentStage } from "@/lib/candidates/actions";
import {
  CANDIDATE_RECRUITMENT_STAGE_LABELS,
  CANDIDATE_RECRUITMENT_STAGE_ORDER,
} from "@/lib/candidates/constants";
import type { CandidateRecruitmentStage } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 max-w-[11rem] min-w-0 rounded-lg border border-input bg-background px-2 py-1 text-xs transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "dark:bg-input/30",
);

export function CandidateListStageSelect({
  candidateId,
  value,
}: {
  candidateId: string;
  value: CandidateRecruitmentStage;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={selectClass}
      value={value}
      disabled={pending}
      aria-label="Etapa del proceso"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as CandidateRecruitmentStage;
        if (next === value) return;
        startTransition(async () => {
          const res = await updateCandidateRecruitmentStage(candidateId, next);
          if (res.ok) {
            router.refresh();
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
  );
}
