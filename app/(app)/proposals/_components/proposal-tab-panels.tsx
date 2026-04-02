import { ComparisonMatrixCard } from "@/components/comparison-matrix-card";
import {
  DetailGrid,
  EmptyState,
  KPIStatCard,
  SectionCard,
} from "@/components/layout";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import {
  formatProposalCurrencyAmount,
  formatProposalPercent,
} from "@/lib/proposals/presentation";
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
      label: "Empresa",
      value: proposal.companyName,
      href: `/companies/${proposal.companyId}`,
    },
    {
      label: "Oportunidad",
      value: proposal.opportunityTitle,
      href: proposal.opportunityId
        ? `/opportunities/${proposal.opportunityId}`
        : undefined,
    },
    {
      label: "Vacante",
      value: proposal.vacancyTitle,
      href: proposal.vacancyId ? `/vacancies/${proposal.vacancyId}` : undefined,
    },
    {
      label: "Candidato",
      value: proposal.candidateName,
      href: proposal.candidateId ? `/candidates/${proposal.candidateId}` : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen comercial
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <KPIStatCard
            label="Tarifa mensual (cliente)"
            value={proposal.finalMonthlyRateLabel}
            emphasis
          />
          <KPIStatCard
            label="Margen bruto"
            value={proposal.grossMarginPercentLabel}
            emphasis
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Contexto del trato
        </p>
        <DetailGrid items={contextItems} />
      </div>

      {comparisonMatrix ? (
        <ComparisonMatrixCard bundle={comparisonMatrix} />
      ) : null}

      <TextSection title="Resumen ejecutivo" value={proposal.executiveSummary} />
      <TextSection title="Perfil del candidato" value={proposal.profileSummary} />
      <TextSection title="Alcance y próximos pasos" value={proposal.scopeNotes} />
      <TextSection title="Notas comerciales" value={proposal.commercialNotes} />
    </div>
  );
}

export function ProposalPricingPanel({ proposal }: { proposal: ProposalDetailUi }) {
  const currency = proposal.currency?.trim() || "MXN";
  return (
    <SectionCard
      title="Resumen de precios"
      description="Cálculo determinista a partir de los datos guardados — auditable y reproducible."
    >
      {proposal.pricing ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Esquema" value={proposal.pricing.scheme} />
          <Kpi label="Horas mensuales" value={String(proposal.pricing.monthlyHours)} />
          <Kpi
            label="Salario neto"
            value={formatProposalCurrencyAmount(
              proposal.pricing.candidateNetSalary,
              currency,
            )}
          />
          <Kpi
            label="Salario bruto"
            value={formatProposalCurrencyAmount(proposal.pricing.grossSalary, currency)}
          />
          <Kpi
            label="Factor IMSS completo"
            value={
              proposal.pricing.fullImssGrossFactor == null
                ? "—"
                : String(proposal.pricing.fullImssGrossFactor)
            }
          />
          <Kpi
            label="Costo patronal"
            value={formatProposalCurrencyAmount(proposal.pricing.employerCost, currency)}
          />
          <Kpi
            label="Carga patronal"
            value={formatProposalCurrencyAmount(
              proposal.pricing.totalEmployerLoad,
              currency,
            )}
          />
          <Kpi
            label="Prestaciones"
            value={formatProposalCurrencyAmount(proposal.pricing.totalBenefits, currency)}
          />
          <Kpi
            label="Bonos (mensual)"
            value={formatProposalCurrencyAmount(
              proposal.pricing.totalBonuses ?? proposal.pricing.bonuses,
              currency,
            )}
          />
          <Kpi
            label="Gastos operativos"
            value={formatProposalCurrencyAmount(
              proposal.pricing.totalOperatingExpenses,
              currency,
            )}
          />
          <Kpi
            label="Subtotal"
            value={formatProposalCurrencyAmount(proposal.pricing.subtotal, currency)}
          />
          <Kpi
            label="Tarifa base (antes de descuento)"
            value={formatProposalCurrencyAmount(
              proposal.pricing.baseMonthlyRateBeforeDiscount,
              currency,
              0,
            )}
          />
          <Kpi
            label="Tarifa mensual final"
            value={formatProposalCurrencyAmount(
              proposal.pricing.finalMonthlyRate,
              currency,
              0,
            )}
            highlight
          />
          <Kpi
            label="Tarifa mensual + IVA"
            value={formatProposalCurrencyAmount(
              proposal.pricing.finalMonthlyRateWithVAT,
              currency,
              0,
            )}
            highlight
          />
          <Kpi
            label="IVA %"
            value={formatProposalPercent(proposal.pricing.vatPercent)}
          />
          <Kpi
            label="Margen bruto (monto)"
            value={formatProposalCurrencyAmount(
              proposal.pricing.grossMarginAmount,
              currency,
            )}
          />
          <Kpi
            label="Margen %"
            value={formatProposalPercent(proposal.pricing.grossMarginPercent)}
            highlight
          />
          <Kpi
            label="Duración estimada (meses)"
            value={String(proposal.pricing.estimatedDurationMonths)}
          />
        </div>
      ) : (
        <EmptyState
          variant="embedded"
          title="Sin datos de precios"
          description="Ingresa los datos económicos en la propuesta para ver este resumen."
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
      description="Texto narrativo de la propuesta para el cliente."
    >
      {value ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {value}
        </p>
      ) : (
        <EmptyState variant="embedded" title="Pendiente de completar" />
      )}
    </SectionCard>
  );
}
