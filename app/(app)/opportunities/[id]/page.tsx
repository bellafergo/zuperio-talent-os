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
import { canManageOpportunities } from "@/lib/auth/opportunity-access";
import { formatOpportunityCurrency } from "@/lib/opportunities/mappers";
import {
  getOpportunityByIdForUi,
  listCompaniesForOpportunityForm,
  listUsersForOpportunityForm,
} from "@/lib/opportunities/queries";

import { OpportunityEditDialog } from "../_components/opportunity-edit-dialog";
import { OpportunityStageBadge } from "../_components/opportunity-stage-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageOpportunities(session?.user?.role);

  const [opportunity, companies, owners] = await Promise.all([
    getOpportunityByIdForUi(id),
    canManage ? listCompaniesForOpportunityForm() : Promise.resolve([]),
    canManage ? listUsersForOpportunityForm() : Promise.resolve([]),
  ]);

  if (!opportunity) {
    notFound();
  }

  const valueDisplay = formatOpportunityCurrency(
    opportunity.valueAmount,
    opportunity.currency,
  );

  return (
    <div className="space-y-8">
      <Link
        href="/opportunities"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to opportunities
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {opportunity.title}
            </h1>
            <div className="shrink-0">
              <OpportunityStageBadge stage={opportunity.stage} />
            </div>
          </div>
          {canManage ? (
            <OpportunityEditDialog
              opportunity={opportunity}
              companies={companies}
              owners={owners}
            />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Deal record · loaded from database
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Company" value={opportunity.companyName} href={`/companies/${opportunity.companyId}`} />
        <DetailField
          label="Owner"
          value={opportunity.ownerName}
        />
        <DetailField
          label="Estimated value"
          value={valueDisplay}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Description</CardTitle>
          <CardDescription>
            Scope, stakeholders, and commercial framing for this opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A structured description and win criteria will live here as the deal
            evolves. Financials above reflect the current estimate in{" "}
            {opportunity.currency}.
          </p>
        </CardContent>
      </Card>

      <PlaceholderSection
        title="Vacancies"
        description="Open roles or hiring tracks tied to this deal."
      />
      <PlaceholderSection
        title="Activity"
        description="Meetings, emails, and stage changes."
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
