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
import { listExternalPublicationsForVacancySafe } from "@/lib/job-board/queries-safe";
import { listApplicationsForVacancyUi } from "@/lib/vacancy-applications/queries";
import { formatTargetRate } from "@/lib/vacancies/mappers";
import { listCandidatesForVacancy } from "@/lib/vacancies/candidates-in-process-queries";
import {
  getVacancyByIdForUi,
  getVacancyEditData,
  listCompaniesForVacancyForm,
  listContactsForVacancyForm,
  listOpportunitiesForVacancyForm,
} from "@/lib/vacancies/queries";

import { VacancyExternalPublicationsSection } from "./_components/vacancy-external-publications-section";
import { VacancyCandidateMatchesSection } from "./_components/vacancy-candidate-matches-section";
import { VacancyCandidatesInProcessSection } from "./_components/vacancy-candidates-in-process-section";
import { VacancyInterviewPrepSection } from "./_components/vacancy-interview-prep-section";
import { VacancyRecruitmentPipelineSection } from "./_components/vacancy-recruitment-pipeline-section";
import { VacancyRequirementsSection } from "./_components/vacancy-requirements-section";
import { VacancyWorkModalitySection } from "./_components/vacancy-work-modality-section";
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

  const [
    vacancy,
    candidateMatches,
    requirements,
    applications,
    externalPublications,
    candidatesInProcess,
    editData,
    companies,
    opportunities,
    contacts,
    skills,
  ] = await Promise.all([
    getVacancyByIdForUi(id),
    listMatchesForVacancyUi(id),
    listVacancyRequirementsForUi(id),
    listApplicationsForVacancyUi(id),
    listExternalPublicationsForVacancySafe(id),
    listCandidatesForVacancy(id),
    canManage ? getVacancyEditData(id) : Promise.resolve(null),
    canManage ? listCompaniesForVacancyForm() : Promise.resolve([]),
    canManage ? listOpportunitiesForVacancyForm() : Promise.resolve([]),
    canManage ? listContactsForVacancyForm() : Promise.resolve([]),
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
              companies={companies}
              opportunities={opportunities}
              contacts={contacts}
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
            value: vacancy.opportunityTitle ?? "—",
            href: vacancy.opportunityId ? `/opportunities/${vacancy.opportunityId}` : undefined,
          },
          {
            label: "Contacto",
            value: vacancy.contactName ?? "—",
            href: vacancy.contactId ? `/contacts/${vacancy.contactId}` : undefined,
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

      <VacancyWorkModalitySection workModality={vacancy.workModality} />

      <VacancyExternalPublicationsSection rows={externalPublications} />

      <VacancyRequirementsSection requirements={requirements} />

      <VacancyCandidatesInProcessSection
        vacancyId={vacancy.id}
        rows={candidatesInProcess}
      />

      <VacancyInterviewPrepSection
        key={vacancy.id}
        vacancyId={vacancy.id}
        vacancyTitle={vacancy.title}
        vacancySeniority={vacancy.seniority}
        vacancySkillsLine={vacancy.skillsLine}
        vacancyRoleSummary={vacancy.roleSummaryLine}
        requirementNames={requirements.map((r) => r.name)}
        candidates={candidatesInProcess.map((r) => ({
          id: r.candidateId,
          displayName: r.displayName,
          role: r.role,
        }))}
      />

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
