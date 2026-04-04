import Link from "next/link";

import { ApplicationStageBadge } from "@/components/application-stage-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CandidateApplicationRowUi } from "@/lib/vacancy-applications/types";

function isRenderableApplication(a: unknown): a is CandidateApplicationRowUi {
  if (!a || typeof a !== "object") return false;
  const o = a as Record<string, unknown>;
  return (
    typeof o.applicationId === "string" &&
    o.applicationId.length > 0 &&
    typeof o.vacancyId === "string" &&
    typeof o.vacancyTitle === "string" &&
    typeof o.companyId === "string" &&
    typeof o.companyName === "string" &&
    typeof o.stage === "string" &&
    typeof o.status === "string"
  );
}

export function CandidateApplicationsSection({
  applications,
}: {
  applications: CandidateApplicationRowUi[];
}) {
  const rows = Array.isArray(applications)
    ? applications.filter(isRenderableApplication)
    : [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Postulaciones</CardTitle>
        <CardDescription>
          Pipelines de reclutamiento en los que el candidato participa o participó
          (independiente de matches y colocaciones).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin postulaciones registradas.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[220px]">Vacante</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="w-[160px]">Etapa</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.applicationId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/vacancies/${a.vacancyId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      <span className="line-clamp-2">{a.vacancyTitle}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link
                      href={`/companies/${a.companyId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {a.companyName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ApplicationStageBadge stage={a.stage} />
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
