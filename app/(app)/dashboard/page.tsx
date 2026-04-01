import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canViewCommercialDashboard } from "@/lib/auth/commercial-dashboard-access";
import { getCommercialDashboardData } from "@/lib/proposals/commercial-dashboard-queries";
import { formatProposalCurrencyAmount } from "@/lib/proposals/presentation";

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
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Commercial dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Proposal pipeline, follow-up risk, and monthly rate totals from saved
          pricing (deterministic). Amounts are summed numerically; mixed
          currencies are not normalised.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Pipeline counts</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard label="Total" value={String(d.counts.total)} />
          <MetricCard label="Draft" value={String(d.counts.draft)} />
          <MetricCard label="Sent" value={String(d.counts.sent)} />
          <MetricCard label="Follow-up due" value={String(d.counts.followUpPending)} />
          <MetricCard label="In negotiation" value={String(d.counts.inNegotiation)} />
          <MetricCard label="Won" value={String(d.counts.won)} />
          <MetricCard label="Lost" value={String(d.counts.lost)} />
        </div>
        <p className="text-xs text-muted-foreground">
          Viewed: {d.counts.viewed} · Follow-up rule: Sent + sentAt older than 2 days
          (same as proposals list).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Revenue (monthly rate)</h2>
        <p className="text-xs text-muted-foreground">
          Sums use <span className="font-medium">finalMonthlyRate</span> where pricing
          exists. <span className="font-medium">Pipeline (non-lost)</span> includes
          Draft, Sent, Viewed, In negotiation, and Won. Lost is excluded from that
          total but shown separately below.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Pipeline (non-lost)"
            value={fmt(d.revenue.pipelineNonLost)}
          />
          <MetricCard label="Sent (value)" value={fmt(d.revenue.pipelineSent)} />
          <MetricCard
            label="Negotiation (value)"
            value={fmt(d.revenue.pipelineNegotiation)}
          />
          <MetricCard label="Won (value)" value={fmt(d.revenue.won)} />
          <MetricCard label="Lost (value)" value={fmt(d.revenue.lost)} />
          <MetricCard label="Avg margin %" value={pct(d.revenue.avgMarginPercent)} />
          <MetricCard
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
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">By status</CardTitle>
            <CardDescription>Count and sum of final monthly rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">By company</CardTitle>
            <CardDescription>Top 15 by pipeline value on this proposal set</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">By owner</CardTitle>
            <CardDescription>Created-by user on the proposal</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">By format</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">By pricing scheme</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Follow-up due</CardTitle>
          <CardDescription>
            Sent status, more than 2 days since{" "}
            <span className="font-medium">sentAt</span> — oldest first
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {d.followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground">None right now.</p>
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
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
