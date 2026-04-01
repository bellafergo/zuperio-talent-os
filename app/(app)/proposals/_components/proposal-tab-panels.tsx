import { ComparisonMatrixCard } from "@/components/comparison-matrix-card";
import {
  DetailGrid,
  EmptyState,
  KPIStatCard,
  SectionCard,
} from "@/components/layout";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import type { ProposalDetailUi } from "@/lib/proposals/types";
import { cn } from "@/lib/utils";

export function ProposalOverviewPanel({
  proposal,
  comparisonMatrix,
}: {
  proposal: ProposalDetailUi;
  comparisonMatrix?: ComparisonMatrixBundle | null;
}) {
  const contextItems = [
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
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Commercial snapshot
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <KPIStatCard
            label="Monthly rate (client)"
            value={proposal.finalMonthlyRateLabel}
            emphasis
          />
          <KPIStatCard
            label="Gross margin"
            value={proposal.grossMarginPercentLabel}
            emphasis
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Deal context
        </p>
        <DetailGrid items={contextItems} />
      </div>

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
      description="Computed outputs from saved inputs — auditable and reproducible."
    >
      {proposal.pricing ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            highlight
          />
          <Kpi
            label="Monthly + VAT"
            value={
              proposal.pricing.finalMonthlyRateWithVAT == null
                ? "—"
                : String(proposal.pricing.finalMonthlyRateWithVAT)
            }
            highlight
          />
          <Kpi label="Gross margin" value={String(proposal.pricing.grossMarginAmount)} />
          <Kpi
            label="Margin %"
            value={`${proposal.pricing.grossMarginPercent.toFixed(1)}%`}
            highlight
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

function Kpi({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-muted/15 px-3 py-2.5",
        highlight &&
          "border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-medium tabular-nums text-foreground",
          highlight ? "text-base font-semibold" : "text-sm",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  return (
    <SectionCard
      title={title}
      description="Narrative fields for client-ready copy."
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
