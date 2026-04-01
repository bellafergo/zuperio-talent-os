import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTargetRate } from "@/lib/vacancies/mappers";
import { getVacancyByIdForUi } from "@/lib/vacancies/queries";

import { VacancyStatusBadge } from "../_components/vacancy-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VacancyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vacancy = await getVacancyByIdForUi(id);

  if (!vacancy) {
    notFound();
  }

  const rateDisplay = formatTargetRate(
    vacancy.targetRateAmount,
    vacancy.currency,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/vacancies"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to vacancies
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {vacancy.title}
          </h1>
          <div className="shrink-0">
            <VacancyStatusBadge status={vacancy.status} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Role record · loaded from database
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Company"
          value={vacancy.companyName}
          href={`/companies/${vacancy.companyId}`}
        />
        <DetailField
          label="Opportunity"
          value={vacancy.opportunityTitle}
          href={`/opportunities/${vacancy.opportunityId}`}
        />
        <DetailField label="Seniority" value={vacancy.seniority} />
        <DetailField label="Target rate" value={rateDisplay} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Work mode</CardTitle>
          <CardDescription>
            Onsite, hybrid, or remote expectations for this role.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Work location and schedule policies will be stored here when the
            hiring workflow is extended. The financial target above is in{" "}
            {vacancy.currency} per hour (bill rate).
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Responsibilities</CardTitle>
          <CardDescription>
            Scope, deliverables, and success criteria for the position.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A structured responsibilities list and must-have skills will replace
            this placeholder as the requisition matures.
          </p>
        </CardContent>
      </Card>

      <PlaceholderSection
        title="Candidates"
        description="Applicants and pipeline stages for this vacancy."
      />
      <PlaceholderSection
        title="Activity"
        description="Notes, interviews, and status changes."
      />
    </div>
  );
}

function DetailField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">
        {href ? (
          <Link
            href={href}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {value}
          </Link>
        ) : (
          value
        )}
      </p>
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
