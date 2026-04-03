"use client";

import Link from "next/link";

import { EmptyState } from "@/components/layout";
import { MatchRecommendationBadge } from "@/components/match-recommendation-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchMatrixRowUi } from "@/lib/matching/types";

export function MatchingDataTable({ rows }: { rows: MatchMatrixRowUi[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        variant="embedded"
        title="Sin matches puntuados"
        description="Las vacantes necesitan skills requeridos y los candidatos perfil estructurado. Ejecuta sincronización de matching desde el flujo de datos o seed."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[140px]">Candidato</TableHead>
          <TableHead className="max-w-[160px]">Vacante</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead className="w-[80px] text-right">Match</TableHead>
          <TableHead className="w-[120px]">Nivel</TableHead>
          <TableHead className="w-[100px]">Detalle</TableHead>
          <TableHead className="min-w-[200px]">Resumen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.matchId}>
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
            <TableCell className="text-muted-foreground">
              {r.companyName}
            </TableCell>
            <TableCell className="bg-muted/15 text-right tabular-nums text-base font-semibold text-foreground">
              {r.score}%
            </TableCell>
            <TableCell>
              <MatchRecommendationBadge recommendation={r.recommendation} />
            </TableCell>
            <TableCell>
              <Link
                href={`/matching/compare/${r.matchId}`}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Ver detalle
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <span
                className="line-clamp-2 text-sm leading-relaxed"
                title={r.explanation}
              >
                {r.explanation}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
