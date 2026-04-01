import type { ProposalsDashboardSummary } from "@/lib/proposals/queries";

export function ProposalsSummaryStrip({ summary }: { summary: ProposalsDashboardSummary }) {
  const items = [
    { label: "Total", value: summary.total },
    { label: "Sent", value: summary.sent },
    { label: "Follow-up due", value: summary.followUpPending },
    { label: "Won", value: summary.won },
    { label: "Lost", value: summary.lost },
  ] as const;

  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm ring-1 ring-foreground/5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-[100px] flex-1 flex-col gap-0.5"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {item.label}
          </span>
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
