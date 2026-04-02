import Link from "next/link";

import { PlacementStatusBadge } from "@/components/placement-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CandidateCurrentAssignmentUi } from "@/lib/placements/types";

export function CandidateCurrentAssignmentSection({
  assignment,
}: {
  assignment: CandidateCurrentAssignmentUi | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Asignación actual</CardTitle>
        <CardDescription>
          Colocación activa en cuenta de cliente (staff augmentation).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {assignment == null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin asignación activa. El candidato no tiene colocación vigente en el sistema.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PlacementStatusBadge status={assignment.status} />
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Cliente
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  <Link
                    href={`/companies/${assignment.companyId}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {assignment.companyName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Rol (vacante)
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  <Link
                    href={`/vacancies/${assignment.vacancyId}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {assignment.vacancyTitle}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Fecha de inicio
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {assignment.startDateLabel}
                </dd>
              </div>
              {assignment.endDateLabel ? (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Fecha de fin
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {assignment.endDateLabel}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
