"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OpportunityListRow } from "@/lib/opportunities/types";

import { OpportunityStageBadge } from "./opportunity-stage-badge";

export function OpportunitiesDataTable({
  opportunities,
}: {
  opportunities: OpportunityListRow[];
}) {
  const router = useRouter();

  const goToOpportunity = React.useCallback(
    (id: string) => {
      router.push(`/opportunities/${id}`);
    },
    [router],
  );

  const onRowKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToOpportunity(id);
      }
    },
    [goToOpportunity],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Opportunity</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead className="w-[130px]">Stage</TableHead>
          <TableHead className="text-right">Estimated value</TableHead>
          <TableHead className="w-[110px]">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {opportunities.map((row) => (
          <TableRow
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => goToOpportunity(row.id)}
            onKeyDown={(e) => onRowKeyDown(e, row.id)}
            aria-label={`View ${row.title} details`}
          >
            <TableCell className="max-w-[240px] font-medium">
              <span className="line-clamp-2">{row.title}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.companyName}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.ownerName}
            </TableCell>
            <TableCell>
              <OpportunityStageBadge stage={row.stage} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.valueLabel}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.updatedAtLabel}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
