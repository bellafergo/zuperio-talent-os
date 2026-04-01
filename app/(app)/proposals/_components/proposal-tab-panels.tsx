import { ComparisonMatrixCard } from "@/components/comparison-matrix-card";
import {
  DetailGrid,
  EmptyState,
  SectionCard,
} from "@/components/layout";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import type { ProposalDetailUi } from "@/lib/proposals/types";

export function ProposalOverviewPanel({
  proposal,
  comparisonMatrix,
}: {
  proposal: ProposalDetailUi;
  comparisonMatrix?: ComparisonMatrixBundle | null;
}) {
  const detailItems = [
    {
      label: "Company",
      value: proposal.companyName,
      href: `/companies/${proposal.companyId}`,
    },
    {
      label: "Opportunity",
      value: proposal.opportunityTitle,
      href: proposal.opportunityId
        ? `/opportunities/${proposal.opportunityId}`
        : undefined,
    },
    {
      label: "Vacancy",
      value: proposal.vacancyTitle,
      href: proposal.vacancyId ? `/vacancies/${proposal.vacancyId}` : undefined,
    },
    {
      label: "Candidate",
      value: proposal.candidateName,
      href: proposal.candidateId ? `/candidates/${proposal.candidateId}` : undefined,
    },
    {
      label: "Monthly (client)",
      value: proposal.finalMonthlyRateLabel,
    },
    {
      label: "Gross margin",
      value: proposal.grossMarginPercentLabel,
    },
  ];

  return (
    <div className="space-y-6">
      <DetailGrid items={detailItems} />
      {comparisonMatrix ? (
        <ComparisonMatrixCard bundle={comparisonMatrix} />
      ) : null}
      <TextSection title="Executive summary" value={proposal.executiveSummary} />
      <TextSection title="Profile summary" value={proposal.profileSummary} />
      <TextSection title="Scope notes" value={proposal.scopeNotes} />
      <TextSection title="Commercial notes" value={proposal.commercialNotes} />
    </div>
  );
}

export function ProposalPricingPanel({ proposal }: { proposal: ProposalDetailUi }) {
  return (
    <SectionCard
      title="Pricing summary"
      description="Inputs are editable; outputs are computed deterministically on save."
    >
      {proposal.pricing ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      ) : (
        <EmptyState
          variant="embedded"
          title="No pricing recorded"
          description="Add pricing on the proposal record to populate this summary."
        />
      )}
    </SectionCard>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/15 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  return (
    <SectionCard
      title={title}
      description="Manual-first narrative fields for client-facing copy."
    >
      {value ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {value}
        </p>
      ) : (
        <EmptyState variant="embedded" title="Not filled yet" />
      )}
    </SectionCard>
  );
}
