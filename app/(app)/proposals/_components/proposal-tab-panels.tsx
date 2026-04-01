import Link from "next/link";

import type { ProposalDetailUi } from "@/lib/proposals/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProposalOverviewPanel({ proposal }: { proposal: ProposalDetailUi }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Company"
          value={proposal.companyName}
          href={`/companies/${proposal.companyId}`}
        />
        <DetailField
          label="Opportunity"
          value={proposal.opportunityTitle}
          href={
            proposal.opportunityId
              ? `/opportunities/${proposal.opportunityId}`
              : undefined
          }
        />
        <DetailField
          label="Vacancy"
          value={proposal.vacancyTitle}
          href={
            proposal.vacancyId ? `/vacancies/${proposal.vacancyId}` : undefined
          }
        />
        <DetailField
          label="Candidate"
          value={proposal.candidateName}
          href={
            proposal.candidateId ? `/candidates/${proposal.candidateId}` : undefined
          }
        />
        <DetailField label="Monthly (client)" value={proposal.finalMonthlyRateLabel} />
        <DetailField label="Gross margin" value={proposal.grossMarginPercentLabel} />
      </div>
      <TextSection title="Executive summary" value={proposal.executiveSummary} />
      <TextSection title="Profile summary" value={proposal.profileSummary} />
      <TextSection title="Scope notes" value={proposal.scopeNotes} />
      <TextSection title="Commercial notes" value={proposal.commercialNotes} />
    </div>
  );
}

export function ProposalPricingPanel({ proposal }: { proposal: ProposalDetailUi }) {
  return (
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
            <Kpi label="Scheme" value={proposal.pricing.scheme} />
            <Kpi label="Monthly hours" value={String(proposal.pricing.monthlyHours)} />
            <Kpi
              label="Net salary"
              value={
                proposal.pricing.candidateNetSalary == null
                  ? "—"
                  : String(proposal.pricing.candidateNetSalary)
              }
            />
            <Kpi
              label="Gross salary"
              value={
                proposal.pricing.grossSalary == null
                  ? "—"
                  : String(proposal.pricing.grossSalary)
              }
            />
            <Kpi
              label="Employer cost"
              value={
                proposal.pricing.employerCost == null
                  ? "—"
                  : String(proposal.pricing.employerCost)
              }
            />
            <Kpi
              label="Employer load"
              value={
                proposal.pricing.totalEmployerLoad == null
                  ? "—"
                  : String(proposal.pricing.totalEmployerLoad)
              }
            />
            <Kpi
              label="Benefits"
              value={
                proposal.pricing.totalBenefits == null
                  ? "—"
                  : String(proposal.pricing.totalBenefits)
              }
            />
            <Kpi
              label="Opex"
              value={
                proposal.pricing.totalOperatingExpenses == null
                  ? "—"
                  : String(proposal.pricing.totalOperatingExpenses)
              }
            />
            <Kpi
              label="Subtotal"
              value={
                proposal.pricing.subtotal == null
                  ? "—"
                  : String(proposal.pricing.subtotal)
              }
            />
            <Kpi
              label="Final monthly rate"
              value={
                proposal.pricing.finalMonthlyRate == null
                  ? "—"
                  : String(proposal.pricing.finalMonthlyRate)
              }
            />
            <Kpi
              label="Monthly + VAT"
              value={
                proposal.pricing.finalMonthlyRateWithVAT == null
                  ? "—"
                  : String(proposal.pricing.finalMonthlyRateWithVAT)
              }
            />
            <Kpi label="Gross margin" value={String(proposal.pricing.grossMarginAmount)} />
            <Kpi
              label="Margin %"
              value={`${proposal.pricing.grossMarginPercent.toFixed(1)}%`}
            />
            <Kpi
              label="Duration (months)"
              value={String(proposal.pricing.estimatedDurationMonths)}
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No pricing recorded.</p>
        )}
      </CardContent>
    </Card>
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
        <CardDescription>
          Manual-first text (optional AI assist can be added later).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {value ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {value}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Not filled yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
