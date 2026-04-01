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
import { getCompanyByIdForUi } from "@/lib/companies/queries";

import { CompanyStatusBadge } from "../_components/company-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const company = await getCompanyByIdForUi(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/companies"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to companies
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {company.name}
          </h1>
          <CompanyStatusBadge status={company.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Account overview · loaded from database
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Industry" value={company.industry || "—"} />
        <DetailField label="Location" value={company.location || "—"} />
        <DetailField label="Owner" value={company.owner} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Notes</CardTitle>
          <CardDescription>
            Internal context and handoff details for this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rich notes and activity summaries will appear here as the workspace
            grows. The core company record above is stored in PostgreSQL.
          </p>
        </CardContent>
      </Card>

      <PlaceholderSection
        title="Contacts"
        description="People associated with this company."
      />
      <PlaceholderSection
        title="Opportunities"
        description="Deals and pursuits linked to this account."
      />
      <PlaceholderSection
        title="Activity"
        description="Calls, meetings, and timeline events."
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
