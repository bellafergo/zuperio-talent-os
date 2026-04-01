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
      description="Pipeline status and follow-up log (no email automation in v1)."
      contentClassName="space-y-4 pt-4"
    >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Sent to client</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{sentAtLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Last follow-up logged</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {lastFollowUpAtLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Follow-ups logged</dt>
            <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">
              {followUpCount}
            </dd>
          </div>
        </dl>

        {isFollowUpPending ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
            Follow-up due: this proposal has been in{" "}
            <span className="font-medium">Sent</span> for more than 2 days since{" "}
            <span className="font-medium">sentAt</span>.
          </p>
        ) : statusValue === "SENT" ? (
          <p className="text-xs text-muted-foreground">
            Not yet in the 2-day follow-up window (or <span className="font-medium">sentAt</span>{" "}
            is not set).
          </p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {canManage ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">Actions</p>
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
