import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listVacanciesForProposalForm,
} from "@/lib/proposals/queries";
import { getProposalByIdForUi } from "@/lib/proposals/queries";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ProposalEditDialog } from "../_components/proposal-edit-dialog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageProposals(session?.user?.role);

  const [proposal, companies, opportunities, vacancies, candidates] = await Promise.all([
    getProposalByIdForUi(id),
    canManage ? listCompaniesForProposalForm() : Promise.resolve([]),
    canManage ? listOpportunitiesForProposalForm() : Promise.resolve([]),
    canManage ? listVacanciesForProposalForm() : Promise.resolve([]),
    canManage ? listCandidatesForProposalForm() : Promise.resolve([]),
  ]);

  if (!proposal) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/proposals"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to proposals
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Proposal · {proposal.companyName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {proposal.status} · {proposal.currency} · valid {proposal.validityDays}d
            </p>
          </div>
          {canManage ? (
            <ProposalEditDialog
              proposal={proposal}
              companies={companies}
              opportunities={opportunities}
              vacancies={vacancies}
              candidates={candidates}
            />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Template-based proposal draft · pricing is deterministic
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Company" value={proposal.companyName} href={`/companies/${proposal.companyId}`} />
        <DetailField label="Opportunity" value={proposal.opportunityTitle} href={proposal.opportunityId ? `/opportunities/${proposal.opportunityId}` : undefined} />
        <DetailField label="Vacancy" value={proposal.vacancyTitle} href={proposal.vacancyId ? `/vacancies/${proposal.vacancyId}` : undefined} />
        <DetailField label="Candidate" value={proposal.candidateName} href={proposal.candidateId ? `/candidates/${proposal.candidateId}` : undefined} />
        <DetailField label="Monthly (client)" value={proposal.clientMonthlyAmountLabel} />
        <DetailField label="Gross margin" value={proposal.grossMarginPercentLabel} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Pricing summary</CardTitle>
          <CardDescription>
            Inputs are editable; outputs are computed deterministically on save.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {proposal.pricing ? (
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Kpi label="Monthly hours" value={String(proposal.pricing.monthlyHours)} />
              <Kpi label="Client rate" value={String(proposal.pricing.clientRate)} />
              <Kpi label="Internal cost" value={proposal.pricing.internalCost == null ? "—" : String(proposal.pricing.internalCost)} />
              <Kpi label="Client monthly" value={String(proposal.pricing.clientMonthlyAmount)} />
              <Kpi label="Gross margin" value={String(proposal.pricing.grossMarginAmount)} />
              <Kpi label="Margin %" value={`${proposal.pricing.grossMarginPercent.toFixed(1)}%`} />
              <Kpi label="Duration (months)" value={String(proposal.pricing.estimatedDurationMonths)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No pricing recorded.</p>
          )}
        </CardContent>
      </Card>

      <TextSection title="Executive summary" value={proposal.executiveSummary} />
      <TextSection title="Profile summary" value={proposal.profileSummary} />
      <TextSection title="Scope notes" value={proposal.scopeNotes} />
      <TextSection title="Commercial notes" value={proposal.commercialNotes} />
    </div>
  );
}

function DetailField({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">
        {href ? (
          <Link href={href} className="underline-offset-4 hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription>Manual-first text section (AI suggestions can be added later).</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {value ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{value}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Not filled yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

