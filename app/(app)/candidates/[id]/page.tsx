import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { getCandidateByIdForUi, getCandidateEditData } from "@/lib/candidates/queries";
import { listMatchesForCandidateUi } from "@/lib/matching/queries";
import { getCurrentAssignmentForCandidateUi } from "@/lib/placements/queries";
import { listCandidateStructuredSkillsForUi, listSkillsForVacancyForm } from "@/lib/skills/queries";
import { listApplicationsForCandidateUi } from "@/lib/vacancy-applications/queries";

import { CandidateAvailabilityBadge } from "../_components/candidate-availability-badge";
import { CandidateEditDialog } from "../_components/candidate-edit-dialog";
import { CandidateApplicationsSection } from "./_components/candidate-applications-section";
import { CandidateCurrentAssignmentSection } from "./_components/candidate-current-assignment-section";
import { CandidateStructuredSkillsSection } from "./_components/candidate-structured-skills-section";
import { CandidateVacancyMatchesSection } from "./_components/candidate-vacancy-matches-section";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const [
    candidate,
    vacancyMatches,
    currentAssignment,
    structuredSkills,
    applications,
    editData,
    skillsCatalog,
  ] = await Promise.all([
    getCandidateByIdForUi(id),
    listMatchesForCandidateUi(id),
    getCurrentAssignmentForCandidateUi(id),
    listCandidateStructuredSkillsForUi(id),
    listApplicationsForCandidateUi(id),
    canManage ? getCandidateEditData(id) : Promise.resolve(null),
    canManage ? listSkillsForVacancyForm() : Promise.resolve([]),
  ]);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/candidates"
        backLabel="Back to candidates"
        title={candidate.displayName}
        description="Talent profile, structured skills, applications, and deterministic vacancy matches."
        meta={<CandidateAvailabilityBadge status={candidate.availabilityStatus} />}
        actions={
          canManage && editData ? (
            <CandidateEditDialog candidate={editData} skillsCatalog={skillsCatalog} />
          ) : null
        }
      />

      <DetailGrid
        items={[
          { label: "Role", value: candidate.role },
          { label: "Seniority", value: candidate.seniority },
          { label: "Current company", value: candidate.currentCompany },
          { label: "Email", value: candidate.email },
          { label: "Phone", value: candidate.phone },
        ]}
      />

      <CandidateStructuredSkillsSection
        skills={structuredSkills}
        legacySkillsLine={candidate.skills}
      />

      <SectionCard
        title="Notes"
        description="Internal context, preferences, and vetting notes."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">{candidate.notes}</p>
      </SectionCard>

      <CandidateCurrentAssignmentSection assignment={currentAssignment} />

      <CandidateApplicationsSection applications={applications} />

      <CandidateVacancyMatchesSection matches={vacancyMatches} />

      <PlaceholderSection
        title="Activity"
        description="Submissions, interviews, and placement history."
      />
    </div>
  );
}
