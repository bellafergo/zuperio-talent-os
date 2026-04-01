"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markProposalFollowUpSent,
  setProposalPipelineStatus,
} from "@/lib/proposals/tracking-actions";
import type { ProposalStatusValue } from "@/lib/proposals/types";

import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TrackingStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/[0.04]",
        highlight &&
          "border-amber-500/25 bg-amber-500/[0.06] ring-amber-500/10 dark:bg-amber-500/[0.08]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export function ProposalCommercialTracking({
  proposalId,
  canManage,
  statusValue,
  isFollowUpPending,
  sentAtLabel,
  lastFollowUpAtLabel,
  followUpCount,
}: {
  proposalId: string;
  canManage: boolean;
  statusValue: ProposalStatusValue;
  isFollowUpPending: boolean;
  sentAtLabel: string;
  lastFollowUpAtLabel: string;
  followUpCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const terminal = statusValue === "WON" || statusValue === "LOST";

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await action();
      if (!r.ok) setError(r.message ?? "Action failed");
      else router.refresh();
    });
  }

  return (
    <SectionCard
      title="Commercial tracking"
      description="Pipeline timing and follow-up log — visible at a glance for stakeholder reviews."
      contentClassName="space-y-4 pt-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <TrackingStat label="Sent to client" value={sentAtLabel} />
        <TrackingStat label="Last follow-up logged" value={lastFollowUpAtLabel} />
        <TrackingStat
          label="Follow-ups logged"
          value={String(followUpCount)}
          highlight={isFollowUpPending}
        />
      </div>

      {isFollowUpPending ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-950 dark:text-amber-100">
          Follow-up due: this proposal has been in{" "}
          <span className="font-semibold">Sent</span> for more than 2 days since{" "}
          <span className="font-semibold">sentAt</span>.
        </p>
      ) : statusValue === "SENT" ? (
        <p className="text-xs text-muted-foreground">
          Not yet in the 2-day follow-up window (or{" "}
          <span className="font-medium">sentAt</span> is not set).
        </p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {canManage ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Actions
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || terminal}
              onClick={() =>
                run(() => setProposalPipelineStatus(proposalId, "IN_NEGOTIATION"))
              }
            >
              Mark as negotiation
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || statusValue === "WON"}
              onClick={() => run(() => setProposalPipelineStatus(proposalId, "WON"))}
            >
              Mark as won
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || statusValue === "LOST"}
              onClick={() => run(() => setProposalPipelineStatus(proposalId, "LOST"))}
            >
              Mark as lost
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending || terminal}
              onClick={() => run(() => markProposalFollowUpSent(proposalId))}
            >
              Mark follow-up sent
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Only Sales and Director can change pipeline status or log follow-ups.
        </p>
      )}
    </SectionCard>
  );
}
