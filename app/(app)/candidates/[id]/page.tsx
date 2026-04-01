import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { getCandidateByIdForUi } from "@/lib/candidates/queries";
import { getCandidateEditData } from "@/lib/candidates/queries";
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
    <div className="space-y-6">
      <Link
        href="/candidates"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to candidates
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {candidate.displayName}
            </h1>
            <CandidateAvailabilityBadge status={candidate.availabilityStatus} />
          </div>
          {canManage && editData ? (
            <CandidateEditDialog candidate={editData} skillsCatalog={skillsCatalog} />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Talent profile · loaded from database
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Role" value={candidate.role} />
        <DetailField label="Seniority" value={candidate.seniority} />
        <DetailField label="Current company" value={candidate.currentCompany} />
        <DetailField label="Email" value={candidate.email} />
        <DetailField label="Phone" value={candidate.phone} />
      </div>

      <CandidateStructuredSkillsSection
        skills={structuredSkills}
        legacySkillsLine={candidate.skills}
      />

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Notes</CardTitle>
          <CardDescription>
            Internal context, preferences, and vetting notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {candidate.notes}
          </p>
        </CardContent>
      </Card>

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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function PlaceholderSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        No {title.toLowerCase()} to show yet. This section is a placeholder.
      </CardContent>
    </Card>
  );
}
