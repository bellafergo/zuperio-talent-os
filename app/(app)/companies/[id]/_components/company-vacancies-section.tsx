import Link from "next/link";

import { EmptyState, SectionCard } from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VacancyListRow } from "@/lib/vacancies/types";

export function CompanyVacanciesSection({
  vacancies,
}: {
  vacancies: VacancyListRow[];
}) {
  return (
    <SectionCard
      title="Vacantes"
      description="Posiciones abiertas o en proceso para esta empresa."
      contentClassName="pt-4"
    >
      {vacancies.length === 0 ? (
        <EmptyState
          variant="embedded"
          title="Sin vacantes"
          description="Cuando se creen vacantes para las oportunidades de esta empresa aparecerán aquí."
        />
      ) : (
        <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-[150px]">Oportunidad</TableHead>
                <TableHead className="w-[110px]">Seniority</TableHead>
                <TableHead className="w-[130px]">Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancies.map((vac) => (
                <TableRow key={vac.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/vacancies/${vac.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {vac.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vac.opportunityId ? (
                      <Link
                        href={`/opportunities/${vac.opportunityId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        <span className="line-clamp-1">{vac.opportunityTitle}</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vac.seniority}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vac.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
