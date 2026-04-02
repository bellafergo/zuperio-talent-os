"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
        Aún no hay propuestas. Crea la primera desde una oportunidad.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[148px]">Propuesta</TableHead>
          <TableHead className="max-w-[240px]">Empresa</TableHead>
          <TableHead className="max-w-[220px]">Oportunidad</TableHead>
          <TableHead className="max-w-[220px]">Vacante</TableHead>
          <TableHead className="max-w-[180px]">Candidato</TableHead>
          <TableHead className="w-[140px]">Estado</TableHead>
          <TableHead className="w-[120px]">Seguimiento</TableHead>
          <TableHead className="w-[140px] text-right">Mensual</TableHead>
          <TableHead className="w-[120px] text-right">Margen</TableHead>
          <TableHead className="w-[120px]">Actualizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.id}
            className="cursor-pointer transition-colors hover:bg-muted/40"
            tabIndex={0}
            aria-label={`Abrir propuesta: ${r.companyName}`}
            onClick={() => router.push(`/proposals/${r.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/proposals/${r.id}`);
              }
            }}
          >
            <TableCell
              className="align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              <Button asChild size="sm" variant="default" className="whitespace-nowrap">
                <Link href={`/proposals/${r.id}`}>Ver propuesta</Link>
              </Button>
            </TableCell>
            <TableCell className="font-medium">
              <Link
                href={`/companies/${r.companyId}`}
                className="text-foreground underline-offset-4 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {r.companyName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.opportunityId ? (
                <Link
                  href={`/opportunities/${r.opportunityId}`}
                  className="underline-offset-4 hover:underline"
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
                  Pendiente
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

