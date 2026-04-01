"use client";

import Link from "next/link";

import { PlacementStatusBadge } from "@/components/placement-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  PlacementCandidateOption,
  PlacementVacancyOption,
} from "@/lib/placements/queries";
import type { PlacementListRowUi } from "@/lib/placements/types";

import { PlacementEditDialog } from "./placement-edit-dialog";

export function ActiveEmployeesDataTable({
  rows,
  canManage,
  candidates,
  vacancies,
}: {
  rows: PlacementListRowUi[];
  canManage: boolean;
  candidates: PlacementCandidateOption[];
  vacancies: PlacementVacancyOption[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
        No placements yet. Seed the database or add assignments later.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[180px]">Candidate</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="max-w-[220px]">Role</TableHead>
          <TableHead className="w-[120px]">Start date</TableHead>
          <TableHead className="w-[110px]">Status</TableHead>
          {canManage ? <TableHead className="w-[110px]" /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              <Link
                href={`/candidates/${r.candidateId}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {r.candidateName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Link
                href={`/companies/${r.companyId}`}
                className="underline-offset-4 hover:underline"
              >
                {r.companyName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Link
                href={`/vacancies/${r.vacancyId}`}
                className="underline-offset-4 hover:underline"
              >
                <span className="line-clamp-2">{r.vacancyTitle}</span>
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.startDateLabel}
            </TableCell>
            <TableCell>
              <PlacementStatusBadge status={r.status} />
            </TableCell>
            {canManage ? (
              <TableCell className="text-right">
                <PlacementEditDialog
                  row={r}
                  candidates={candidates}
                  vacancies={vacancies}
                />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
