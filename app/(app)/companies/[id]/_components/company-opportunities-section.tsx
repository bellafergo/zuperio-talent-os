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
import type { OpportunityListRow } from "@/lib/opportunities/types";

export function CompanyOpportunitiesSection({
  opportunities,
}: {
  opportunities: OpportunityListRow[];
}) {
  return (
    <SectionCard
      title="Oportunidades"
      description="Negocios y seguimientos ligados a esta cuenta."
      contentClassName="pt-4"
    >
      {opportunities.length === 0 ? (
        <EmptyState
          variant="embedded"
          title="Sin oportunidades"
          description="Cuando se creen oportunidades para esta empresa aparecerán aquí."
        />
      ) : (
        <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-[160px]">Etapa</TableHead>
                <TableHead className="w-[130px]">Valor</TableHead>
                <TableHead className="w-[120px]">Actualizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {opp.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.stage}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.valueLabel}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.updatedAtLabel}
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
