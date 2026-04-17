import Link from "next/link";

import { SectionCard } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VacancyCandidateInProcessRowUi } from "@/lib/vacancies/candidates-in-process-queries";

export function VacancyCandidatesInProcessSection({
  vacancyId,
  rows,
}: {
  vacancyId: string;
  rows: VacancyCandidateInProcessRowUi[];
}) {
  return (
    <SectionCard
      title="Candidatos en proceso"
      description="Postulaciones activas y candidatos con esta vacante vinculada en pipeline. Rol, disponibilidad y etapas de reclutamiento."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/candidates">Agregar / gestionar candidatos</Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          Para vincular o editar, usa el banco de talento o el embudo de abajo.
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay candidatos en proceso aún.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="w-[100px]">Senioridad</TableHead>
              <TableHead className="min-w-[140px]">Etapa reclutamiento</TableHead>
              <TableHead className="min-w-[140px]">Etapa selección</TableHead>
              <TableHead className="min-w-[160px]">Disponibilidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${vacancyId}-${r.candidateId}`}>
                <TableCell className="font-medium">
                  <Link
                    href={`/candidates/${r.candidateId}`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {r.displayName}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {r.role}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.seniorityLabel}
                </TableCell>
                <TableCell className="text-sm">{r.recruitmentStageLabel}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.selectionStageLabel ?? (
                    <span className="italic">Solo pipeline</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.availabilityLabel}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
