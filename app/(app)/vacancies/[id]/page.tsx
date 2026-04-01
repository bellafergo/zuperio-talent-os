import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { canManageApplications } from "@/lib/auth/application-access";
import { canManageVacancies } from "@/lib/auth/vacancy-access";
import { listMatchesForVacancyUi } from "@/lib/matching/queries";
import { listSkillsForVacancyForm, listVacancyRequirementsForUi } from "@/lib/skills/queries";
import { listApplicationsForVacancyUi } from "@/lib/vacancy-applications/queries";
import { formatTargetRate } from "@/lib/vacancies/mappers";
import {
  getVacancyByIdForUi,
  getVacancyEditData,
  listOpportunitiesForVacancyForm,
} from "@/lib/vacancies/queries";

import { VacancyCandidateMatchesSection } from "./_components/vacancy-candidate-matches-section";
import { VacancyRecruitmentPipelineSection } from "./_components/vacancy-recruitment-pipeline-section";
import { VacancyRequirementsSection } from "./_components/vacancy-requirements-section";
import { VacancyEditDialog } from "../_components/vacancy-edit-dialog";
import { VacancyStatusBadge } from "../_components/vacancy-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VacancyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageVacancies(session?.user?.role);
  const canManageApps = canManageApplications(session?.user?.role);

  const [vacancy, candidateMatches, requirements, applications, editData, opportunities, skills] =
    await Promise.all([
      getVacancyByIdForUi(id),
      listMatchesForVacancyUi(id),
      listVacancyRequirementsForUi(id),
      listApplicationsForVacancyUi(id),
      canManage ? getVacancyEditData(id) : Promise.resolve(null),
      canManage ? listOpportunitiesForVacancyForm() : Promise.resolve([]),
      canManage ? listSkillsForVacancyForm() : Promise.resolve([]),
    ]);

  if (!vacancy) {
    notFound();
  }

  const rateDisplay = formatTargetRate(
    vacancy.targetRateAmount,
    vacancy.currency,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/vacancies"
        backLabel="Volver a vacantes"
        title={vacancy.title}
        description="Requisición, requisitos estructurados, embudo de reclutamiento y matches puntuados."
        meta={
          <div className="shrink-0">
            <VacancyStatusBadge status={vacancy.status} />
          </div>
        }
        actions={
          canManage && editData ? (
            <VacancyEditDialog
              vacancy={editData}
              opportunities={opportunities}
              skills={skills}
            />
          ) : null
        }
      />

      <DetailGrid
        items={[
          {
            label: "Empresa",
            value: vacancy.companyName,
            href: `/companies/${vacancy.companyId}`,
          },
          {
            label: "Oportunidad",
            value: vacancy.opportunityTitle,
            href: `/opportunities/${vacancy.opportunityId}`,
          },
          { label: "Senioridad", value: vacancy.seniority },
          { label: "Tarifa objetivo", value: rateDisplay },
          {
            label: "Skills (texto heredado)",
            value: vacancy.skillsLine ?? "—",
          },
          {
            label: "Alcance del rol",
            value: vacancy.roleSummaryLine ?? "—",
          },
        ]}
      />

      <SectionCard
        title="Modalidad de trabajo"
        description="Expectativas de presencial, híbrido o remoto para el rol."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ubicación y políticas de horario se guardarán aquí cuando se extienda
          el flujo de contratación. La tarifa objetivo arriba está en{" "}
          {vacancy.currency} por hora (facturación al cliente).
        </p>
      </SectionCard>

      <VacancyRequirementsSection requirements={requirements} />

      <VacancyRecruitmentPipelineSection
        applications={applications}
        canManage={canManageApps}
      />

      <SectionCard
        title="Responsabilidades"
        description="Alcance, entregables y criterios de éxito del puesto."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Más adelante se pueden añadir responsabilidades estructuradas. El
          matching usa requisitos estructurados; el texto libre de skills es solo
          para lectura humana.
        </p>
      </SectionCard>

      <VacancyCandidateMatchesSection matches={candidateMatches} />

      <PlaceholderSection
        title="Actividad"
        description="Notas, entrevistas y cambios de estado."
      />
    </div>
  );
}
