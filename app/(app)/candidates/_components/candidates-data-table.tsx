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
          <TableHead>Candidato</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead className="max-w-[280px]">Competencias</TableHead>
          <TableHead className="w-[90px]">Senioridad</TableHead>
          <TableHead className="min-w-[128px] max-w-[200px]">Disponibilidad</TableHead>
          <TableHead className="min-w-[120px] max-w-[160px]">Reclutamiento</TableHead>
          <TableHead className="min-w-[120px] max-w-[200px]">Vacante</TableHead>
          <TableHead className="w-[100px]">Actualizado</TableHead>
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
            aria-label={`Ver detalle de ${row.displayName}`}
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
            <TableCell className="align-top">
              <div className="flex flex-col gap-1">
                <CandidateAvailabilityBadge
                  status={row.availabilityStatus}
                  label={row.availabilityBadgeLabel}
                />
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {row.availabilityBadgeLabel}
                </span>
              </div>
            </TableCell>
            <TableCell
              className="max-w-[160px] align-top text-muted-foreground"
              title={row.pipelineContextLabel}
            >
              <span className="line-clamp-2 text-sm">{row.pipelineContextLabel}</span>
            </TableCell>
            <TableCell
              className="max-w-[200px] align-top text-muted-foreground"
              title={
                row.pipelineVacancyLine === "—"
                  ? undefined
                  : row.pipelineVacancyLine
              }
            >
              <span className="line-clamp-2 text-sm">{row.pipelineVacancyLine}</span>
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
