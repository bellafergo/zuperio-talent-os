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
import { JobBoardSourceBadge } from "@/components/job-board-source-badge";
import type { VacancyPipelineRowUi } from "@/lib/vacancy-applications/types";

import { VacancyApplicationEditDialog } from "./vacancy-application-edit-dialog";

export function VacancyRecruitmentPipelineSection({
  applications,
  canManage,
}: {
  applications: VacancyPipelineRowUi[];
  canManage: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Embudo de reclutamiento</CardTitle>
        <CardDescription>
          Candidatos en el proceso de esta vacante. Independiente de scores de
          match y colocaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay postulaciones registradas para esta vacante.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Candidato</TableHead>
                <TableHead className="w-[160px]">Etapa</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead>Origen</TableHead>
                {canManage ? <TableHead className="w-[110px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.applicationId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/candidates/${a.candidateId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {a.candidateName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ApplicationStageBadge stage={a.stage} />
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      {a.jobBoardProvider ? (
                        <JobBoardSourceBadge provider={a.jobBoardProvider} />
                      ) : null}
                      <span>{a.sourceLabel}</span>
                    </div>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <VacancyApplicationEditDialog row={a} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
