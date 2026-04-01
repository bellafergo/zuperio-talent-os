import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCandidateByIdForUi } from "@/lib/candidates/queries";
import { listMatchesForCandidateUi } from "@/lib/matching/queries";
import { getCurrentAssignmentForCandidateUi } from "@/lib/placements/queries";

import { CandidateAvailabilityBadge } from "../_components/candidate-availability-badge";
import { CandidateCurrentAssignmentSection } from "./_components/candidate-current-assignment-section";
import { CandidateVacancyMatchesSection } from "./_components/candidate-vacancy-matches-section";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [candidate, vacancyMatches, currentAssignment] = await Promise.all([
    getCandidateByIdForUi(id),
    listMatchesForCandidateUi(id),
    getCurrentAssignmentForCandidateUi(id),
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {candidate.displayName}
          </h1>
          <CandidateAvailabilityBadge status={candidate.availabilityStatus} />
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

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Skills</CardTitle>
          <CardDescription>
            Parsed from the comma-separated list on the record.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {candidate.skillTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {candidate.skillTags.map((tag, i) => (
                <Badge
                  key={`${tag}-${i}`}
                  variant="outline"
                  className="font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
