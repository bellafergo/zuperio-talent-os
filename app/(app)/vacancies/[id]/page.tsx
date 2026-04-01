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
        backLabel="Back to vacancies"
        title={vacancy.title}
        description="Requisition record, structured requirements, pipeline, and scored candidate matches."
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
            label: "Company",
            value: vacancy.companyName,
            href: `/companies/${vacancy.companyId}`,
          },
          {
            label: "Opportunity",
            value: vacancy.opportunityTitle,
            href: `/opportunities/${vacancy.opportunityId}`,
          },
          { label: "Seniority", value: vacancy.seniority },
          { label: "Target rate", value: rateDisplay },
          {
            label: "Skills (legacy text)",
            value: vacancy.skillsLine ?? "—",
          },
          {
            label: "Role scope",
            value: vacancy.roleSummaryLine ?? "—",
          },
        ]}
      />

      <SectionCard
        title="Work mode"
        description="Onsite, hybrid, or remote expectations for this role."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Work location and schedule policies will be stored here when the hiring
          workflow is extended. The financial target above is in{" "}
          {vacancy.currency} per hour (bill rate).
        </p>
      </SectionCard>

      <VacancyRequirementsSection requirements={requirements} />

      <VacancyRecruitmentPipelineSection
        applications={applications}
        canManage={canManageApps}
      />

      <SectionCard
        title="Responsibilities"
        description="Scope, deliverables, and success criteria for the position."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Structured responsibilities can extend this section later. Matching uses
          structured requirements; legacy skill text is for humans only.
        </p>
      </SectionCard>

      <VacancyCandidateMatchesSection matches={candidateMatches} />

      <PlaceholderSection
        title="Activity"
        description="Notes, interviews, and status changes."
      />
    </div>
  );
}
