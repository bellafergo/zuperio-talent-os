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
import type { VacancyListRow } from "@/lib/vacancies/types";

import { VacancyStatusBadge } from "./vacancy-status-badge";

export function VacanciesDataTable({ vacancies }: { vacancies: VacancyListRow[] }) {
  const router = useRouter();

  const goToVacancy = React.useCallback(
    (id: string) => {
      router.push(`/vacancies/${id}`);
    },
    [router],
  );

  const onRowKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToVacancy(id);
      }
    },
    [goToVacancy],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[200px]">Vacante</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead className="max-w-[220px]">Oportunidad</TableHead>
          <TableHead className="w-[90px]">Senioridad</TableHead>
          <TableHead className="w-[120px]">Estado</TableHead>
          <TableHead className="text-right">Tarifa objetivo</TableHead>
          <TableHead className="w-[100px]">Actualizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vacancies.map((row) => (
          <TableRow
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => goToVacancy(row.id)}
            onKeyDown={(e) => onRowKeyDown(e, row.id)}
            aria-label={`Ver detalle de ${row.title}`}
          >
            <TableCell className="max-w-[200px] font-medium">
              <span className="line-clamp-2">{row.title}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.companyName}
            </TableCell>
            <TableCell className="max-w-[220px] text-muted-foreground">
              <span className="line-clamp-2">{row.opportunityTitle ?? "—"}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">{row.seniority}</TableCell>
            <TableCell>
              <VacancyStatusBadge status={row.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.targetRateLabel}
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
