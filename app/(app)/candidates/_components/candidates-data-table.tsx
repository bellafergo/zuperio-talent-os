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
import type { CandidateUi } from "@/lib/candidates/types";

import { CandidateAvailabilityBadge } from "./candidate-availability-badge";

export function CandidatesDataTable({ candidates }: { candidates: CandidateUi[] }) {
  const router = useRouter();

  const goToCandidate = React.useCallback(
    (id: string) => {
      router.push(`/candidates/${id}`);
    },
    [router],
  );

  const onRowKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToCandidate(id);
      }
    },
    [goToCandidate],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="max-w-[280px]">Skills</TableHead>
          <TableHead className="w-[90px]">Seniority</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-[100px]">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((row) => (
          <TableRow
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => goToCandidate(row.id)}
            onKeyDown={(e) => onRowKeyDown(e, row.id)}
            aria-label={`View ${row.displayName} details`}
          >
            <TableCell className="font-medium">{row.displayName}</TableCell>
            <TableCell className="text-muted-foreground">{row.role}</TableCell>
            <TableCell
              className="max-w-[280px] truncate text-muted-foreground"
              title={row.skills}
            >
              {row.skills}
            </TableCell>
            <TableCell className="text-muted-foreground">{row.seniority}</TableCell>
            <TableCell>
              <CandidateAvailabilityBadge status={row.availabilityStatus} />
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
