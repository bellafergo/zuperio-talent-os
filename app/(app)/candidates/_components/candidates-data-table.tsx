"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CandidateUi } from "@/lib/candidates/types";
import { cn } from "@/lib/utils";

import { CandidateAvailabilityBadge } from "./candidate-availability-badge";

export type CandidatesTableRowActions = {
  canManage: boolean;
  canProposals: boolean;
  pendingEditId: string | null;
  onProposal: (row: CandidateUi) => void;
  onEdit: (row: CandidateUi) => void;
  onCv: (row: CandidateUi) => void;
};

export function CandidatesDataTable({
  candidates,
  rowActions,
}: {
  candidates: CandidateUi[];
  rowActions?: CandidatesTableRowActions;
}) {
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

  const showActions = Boolean(rowActions);

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
          {showActions ? (
            <TableHead className="w-[52px] px-2 text-right">Acciones</TableHead>
          ) : null}
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
            {showActions && rowActions ? (
              <TableCell
                className="w-[52px] px-2 text-right align-middle"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <CandidatesRowActionsMenu row={row} actions={rowActions} />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CandidatesRowActionsMenu({
  row,
  actions,
}: {
  row: CandidateUi;
  actions: CandidatesTableRowActions;
}) {
  const hasLinkedVacancy = Boolean(row.pipelineVacancyId?.trim());
  const editLabel = !hasLinkedVacancy
    ? "Vincular a vacante / editar"
    : "Editar candidato";
  const editPending = actions.pendingEditId === row.id;

  const menuContentClass = cn(
    "z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  );

  const itemClass = cn(
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
    "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  );

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={`Acciones para ${row.displayName}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontalIcon className="size-4" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={menuContentClass} sideOffset={4} align="end">
          {actions.canProposals ? (
            <DropdownMenu.Item
              className={itemClass}
              onSelect={() => actions.onProposal(row)}
            >
              Crear propuesta
            </DropdownMenu.Item>
          ) : null}
          {actions.canManage ? (
            <DropdownMenu.Item
              className={itemClass}
              disabled={editPending}
              onSelect={() => actions.onEdit(row)}
            >
              {editPending ? "Cargando…" : editLabel}
            </DropdownMenu.Item>
          ) : null}
          {actions.canManage ? (
            <DropdownMenu.Item
              className={itemClass}
              onSelect={() => actions.onCv(row)}
            >
              Subir o reemplazar CV
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
