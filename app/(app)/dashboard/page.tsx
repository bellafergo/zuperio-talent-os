import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canViewCommercialDashboard } from "@/lib/auth/commercial-dashboard-access";
import { getCommercialDashboardData } from "@/lib/proposals/commercial-dashboard-queries";
import { formatProposalCurrencyAmount } from "@/lib/proposals/presentation";

import {
  EmptyState,
  KPIStatCard,
  PageHeader,
  SectionCard,
  SectionHeading,
} from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  PricingScheme,
  ProposalFormat,
  ProposalStatus,
} from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const EUR = "EUR";

function statusLabel(s: ProposalStatus): string {
  const m: Record<ProposalStatus, string> = {
    DRAFT: "Draft",
    SENT: "Sent",
    VIEWED: "Viewed",
    IN_NEGOTIATION: "In negotiation",
    WON: "Won",
    LOST: "Lost",
  };
  return m[s];
}

function formatScheme(s: PricingScheme): string {
  return s === "FULL_IMSS" ? "Full IMSS" : "Mixed";
}

function formatFormat(f: ProposalFormat): string {
  return f === "DETAILED" ? "Detailed" : "Simple";
}

function formatSentAt(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

export default async function CommercialDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!canViewCommercialDashboard(session.user.role)) {
    redirect("/");
  }

  const d = await getCommercialDashboardData();

  const fmt = (n: number) => formatProposalCurrencyAmount(n, EUR, 0);
  const pct = (n: number | null) =>
    n == null ? "—" : `${n.toFixed(1)}%`;

  return (
    <>
      <PageHeader
        variant="list"
        eyebrow="Commercial"
        title="Dashboard"
        description="Proposal pipeline, follow-up risk, and monthly rate totals from saved pricing (deterministic). Amounts are summed numerically; mixed currencies are not normalised."
      />

      <section className="space-y-4">
        <SectionHeading title="Pipeline counts" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <KPIStatCard label="Total" value={String(d.counts.total)} />
          <KPIStatCard label="Draft" value={String(d.counts.draft)} />
          <KPIStatCard label="Sent" value={String(d.counts.sent)} />
          <KPIStatCard
            label="Follow-up due"
            value={String(d.counts.followUpPending)}
          />
          <KPIStatCard
            label="In negotiation"
            value={String(d.counts.inNegotiation)}
          />
          <KPIStatCard label="Won" value={String(d.counts.won)} />
          <KPIStatCard label="Lost" value={String(d.counts.lost)} />
        </div>
        <p className="text-xs text-muted-foreground">
          Viewed: {d.counts.viewed} · Follow-up rule: Sent + sentAt older than 2
          days (same as proposals list).
        </p>
      </section>

      <section className="space-y-4">
        <SectionHeading title="Revenue (monthly rate)" />
        <p className="text-xs text-muted-foreground">
          Sums use <span className="font-medium text-foreground">finalMonthlyRate</span>{" "}
          where pricing exists.{" "}
          <span className="font-medium text-foreground">Pipeline (non-lost)</span>{" "}
          includes Draft, Sent, Viewed, In negotiation, and Won. Lost is excluded
          from that total but shown separately below.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPIStatCard
            label="Pipeline (non-lost)"
            value={fmt(d.revenue.pipelineNonLost)}
          />
          <KPIStatCard label="Sent (value)" value={fmt(d.revenue.pipelineSent)} />
          <KPIStatCard
            label="Negotiation (value)"
            value={fmt(d.revenue.pipelineNegotiation)}
          />
          <KPIStatCard label="Won (value)" value={fmt(d.revenue.won)} />
          <KPIStatCard label="Lost (value)" value={fmt(d.revenue.lost)} />
          <KPIStatCard label="Avg margin %" value={pct(d.revenue.avgMarginPercent)} />
          <KPIStatCard
            label="Avg proposal value"
            value={
              d.revenue.avgProposalValue == null
                ? "—"
                : fmt(Math.round(d.revenue.avgProposalValue * 100) / 100)
            }
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="By status"
          description="Count and sum of final monthly rate"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byStatus.map((r) => (
                <TableRow key={r.status}>
                  <TableCell>{statusLabel(r.status)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmt(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard
          title="By company"
          description="Top 15 by pipeline value on this proposal set"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byCompany.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No proposals yet.
                  </TableCell>
                </TableRow>
              ) : (
                d.byCompany.map((r) => (
                  <TableRow key={r.companyId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/companies/${r.companyId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {r.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {fmt(r.valueSum)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="By owner"
          description="Created-by user on the proposal"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byOwner.map((r) => (
                <TableRow key={r.userId ?? "none"}>
                  <TableCell>{r.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmt(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="By format">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byFormat.map((r) => (
                <TableRow key={r.format}>
                  <TableCell>{formatFormat(r.format)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmt(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="By pricing scheme">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byScheme.map((r) => (
                <TableRow key={r.scheme}>
                  <TableCell>{formatScheme(r.scheme)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmt(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <SectionCard
        title="Follow-up due"
        description={
          <>
            Sent status, more than 2 days since{" "}
            <span className="font-medium text-foreground">sentAt</span> — oldest
            first
          </>
        }
      >
        {d.followUps.length === 0 ? (
          <EmptyState
            variant="embedded"
            title="None right now"
            description="No proposals are currently in the follow-up window."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Follow-ups logged</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.followUps.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/proposals/${r.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      Open
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.companyName}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatSentAt(r.sentAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.followUpCount}
                  </TableCell>
                  <TableCell>{statusLabel(r.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </>
  );
}
