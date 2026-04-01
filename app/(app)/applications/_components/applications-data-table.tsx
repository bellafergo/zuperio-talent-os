"use client";

import Link from "next/link";

import { ApplicationStageBadge } from "@/components/application-stage-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApplicationMatrixRowUi } from "@/lib/vacancy-applications/types";

export function ApplicationsDataTable({ rows }: { rows: ApplicationMatrixRowUi[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
        No applications yet. Seed the database or add pipeline rows later.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[140px]">Candidate</TableHead>
          <TableHead className="max-w-[180px]">Vacancy</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="w-[150px]">Stage</TableHead>
          <TableHead className="w-[90px]">Status</TableHead>
          <TableHead>Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.applicationId}>
            <TableCell className="font-medium">
              <Link
                href={`/candidates/${r.candidateId}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {r.candidateName}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={`/vacancies/${r.vacancyId}`}
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                <span className="line-clamp-2">{r.vacancyTitle}</span>
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{r.companyName}</TableCell>
            <TableCell>
              <ApplicationStageBadge stage={r.stage} />
            </TableCell>
            <TableCell>
              <ApplicationStatusBadge status={r.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{r.sourceLabel}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
