"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProposalListRowUi } from "@/lib/proposals/types";

import { ProposalStatusBadge } from "./proposal-status-badge";

export function ProposalsTable({ rows }: { rows: ProposalListRowUi[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
        No proposals yet. Create the first proposal for an opportunity.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[240px]">Company</TableHead>
          <TableHead className="max-w-[220px]">Opportunity</TableHead>
          <TableHead className="max-w-[220px]">Vacancy</TableHead>
          <TableHead className="max-w-[180px]">Candidate</TableHead>
          <TableHead className="w-[140px]">Status</TableHead>
          <TableHead className="w-[120px]">Follow-up</TableHead>
          <TableHead className="w-[140px] text-right">Monthly</TableHead>
          <TableHead className="w-[120px] text-right">Margin</TableHead>
          <TableHead className="w-[120px]">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              <Link
                href={`/proposals/${r.id}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {r.companyName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.opportunityId ? (
                <Link
                  href={`/opportunities/${r.opportunityId}`}
                  className="underline-offset-4 hover:underline"
                >
                  <span className="line-clamp-1">{r.opportunityTitle}</span>
                </Link>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.vacancyId ? (
                <Link
                  href={`/vacancies/${r.vacancyId}`}
                  className="underline-offset-4 hover:underline"
                >
                  <span className="line-clamp-1">{r.vacancyTitle}</span>
                </Link>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.candidateId ? (
                <Link
                  href={`/candidates/${r.candidateId}`}
                  className="underline-offset-4 hover:underline"
                >
                  <span className="line-clamp-1">{r.candidateName}</span>
                </Link>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              <ProposalStatusBadge label={r.status} value={r.statusValue} />
            </TableCell>
            <TableCell>
              {r.isFollowUpPending ? (
                <Badge variant="outline" className="border-amber-500/60 text-amber-900 dark:text-amber-200">
                  Due
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {r.finalMonthlyRateLabel}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {r.grossMarginPercentLabel}
            </TableCell>
            <TableCell className="text-muted-foreground">{r.updatedAtLabel}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

