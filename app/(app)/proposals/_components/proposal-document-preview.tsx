import type { ReactNode } from "react";

import type { ProposalDetailUi } from "@/lib/proposals/types";
import {
  formatProposalCurrencyAmount,
  formatProposalPercent,
} from "@/lib/proposals/presentation";

import "./proposal-document.css";

type ProposalDocumentPreviewProps = {
  proposal: ProposalDetailUi;
  preparedByDisplay: string;
  /** Hide the in-app print hint (PDF export and bare print view). */
  hidePrintHint?: boolean;
};

const STANDARD_CONDITIONS = [
  "This commercial proposal is indicative and subject to contract. Pricing reflects the assumptions and inputs recorded in Zuperio at the time of issue.",
  "Engagement terms, notice periods, and deliverables will be confirmed in the master services agreement or statement of work.",
  "This proposal remains valid for the validity period stated on this document unless withdrawn in writing earlier.",
];

export function ProposalDocumentPreview({
  proposal,
  preparedByDisplay,
  hidePrintHint = false,
}: ProposalDocumentPreviewProps) {
  const currency = proposal.currency?.trim() || "MXN";
  const isDetailed = proposal.formatValue === "DETAILED";
  const p = proposal.pricing;

  const today = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="proposal-print-root space-y-3">
      {!hidePrintHint ? (
        <p className="proposal-no-print text-xs text-muted-foreground">
          Fixed Zuperio layout — use{" "}
          <span className="font-medium text-foreground">Download PDF</span> on
          this page, or your browser{" "}
          <span className="font-medium text-foreground">Print</span> →{" "}
          <span className="font-medium text-foreground">Save as PDF</span>.
        </p>
      ) : null}
      <article
        className="proposal-print-sheet mx-auto max-w-[720px] px-8 py-10"
        aria-label="Proposal preview"
      >
        <header className="border-b border-[var(--proposal-doc-border)] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                Zuperio
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Propuesta comercial
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Staff augmentation · {proposal.format} · {proposal.type}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{today}</p>
              <p>Ref. {proposal.id.slice(0, 8)}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Cliente
            </h3>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {proposal.companyName}
            </p>
            {proposal.opportunityTitle !== "—" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Oportunidad: {proposal.opportunityTitle}
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Elaborado por
            </h3>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {preparedByDisplay}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Zuperio Talent OS</p>
          </div>
        </section>

        <section className="mt-8">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Recurso propuesto
          </h3>
          <table className="mt-3">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Rol / vacante</th>
                <th className="num">Horas mensuales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-foreground">
                  {proposal.candidateName}
                </td>
                <td className="text-muted-foreground">
                  {proposal.vacancyTitle !== "—"
                    ? proposal.vacancyTitle
                    : proposal.opportunityTitle}
                </td>
                <td className="num tabular-nums text-foreground">
                  {p ? String(p.monthlyHours) : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            {isDetailed ? "Desglose económico" : "Resumen de precios"}
          </h3>
          {p ? (
            isDetailed ? (
              <DetailedPricingTable currency={currency} proposal={proposal} />
            ) : (
              <SimplePricingTable currency={currency} proposal={proposal} />
            )
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No pricing block on this proposal yet.
            </p>
          )}
        </section>

        <ProposalNarrativeSections proposal={proposal} />

        <section className="mt-8">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Conditions
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            {STANDARD_CONDITIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {proposal.commercialNotes?.trim() ? (
            <div className="mt-4 rounded-md border border-[var(--proposal-doc-border)] bg-muted/20 px-3 py-2 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-muted-foreground">
                Commercial remarks
              </p>
              <p className="mt-1 whitespace-pre-wrap">{proposal.commercialNotes}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-10 border-t border-[var(--proposal-doc-border)] pt-6">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Acceptance
          </h3>
          <p className="mt-3 text-xs text-muted-foreground">
            By signing below, the client confirms acceptance of this commercial
            proposal subject to final contract.
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-foreground">
                For {proposal.companyName}
              </p>
              <div className="mt-10 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                {"Name & title"}
              </div>
              <div className="mt-6 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                {"Signature & date"}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">For Zuperio</p>
              <div className="mt-10 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                {"Name & title"}
              </div>
              <div className="mt-6 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                {"Signature & date"}
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}

function SimplePricingTable({
  proposal,
  currency,
}: {
  proposal: ProposalDetailUi;
  currency: string;
}) {
  const p = proposal.pricing!;
  const rows: { label: string; value: string }[] = [
    { label: "Pricing scheme", value: p.scheme },
    {
      label: "Monthly commercial rate (excl. VAT)",
      value: formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0),
    },
    {
      label: "Indicative monthly rate (incl. VAT)",
      value: formatProposalCurrencyAmount(p.finalMonthlyRateWithVAT, currency, 0),
    },
    {
      label: "Gross margin",
      value: formatProposalPercent(p.grossMarginPercent),
    },
    {
      label: "Estimated duration (months)",
      value: String(p.estimatedDurationMonths),
    },
    {
      label: "Proposal validity (days)",
      value: String(proposal.validityDays),
    },
  ];
  return (
    <table className="mt-3">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="w-[55%] text-muted-foreground">{r.label}</td>
            <td className="num font-medium text-foreground">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailedPricingTable({
  proposal,
  currency,
}: {
  proposal: ProposalDetailUi;
  currency: string;
}) {
  const p = proposal.pricing!;
  const totalBonuses = p.totalBonuses ?? p.bonuses;

  const estEmployeeDeductions =
    p.grossSalary != null && p.candidateNetSalary != null
      ? Math.round((p.grossSalary - p.candidateNetSalary) * 100) / 100
      : null;
  const showEstDeductions =
    estEmployeeDeductions != null && Math.abs(estEmployeeDeductions) > 0.005;

  return (
    <div className="proposal-doc-economic mt-3 space-y-0">
      <p className="proposal-doc-note">
        <span className="font-medium text-foreground">Context:</span>{" "}
        {p.scheme} · {p.monthlyHours} h/month · proposal validity{" "}
        {proposal.validityDays} days. Amounts are monthly unless stated.
        Informative lines do not change the commercial calculation.
      </p>

      <p className="proposal-doc-block-title">A. Compensation base</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Net salary (candidate take-home)"
          value={formatProposalCurrencyAmount(p.candidateNetSalary, currency)}
        />
        <EconRow
          label="Gross salary (payroll basis)"
          value={formatProposalCurrencyAmount(p.grossSalary, currency)}
        />
        {showEstDeductions ? (
          <EconRow
            label="Est. employee deductions (informative: gross − net)"
            value={formatProposalCurrencyAmount(estEmployeeDeductions, currency)}
          />
        ) : null}
      </EconBlockTable>

      <p className="proposal-doc-block-title">B. Bonuses</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Bonuses (monthly accrual)"
          value={formatProposalCurrencyAmount(p.bonuses, currency)}
        />
        <EconRow
          label="Total bonuses (loaded into cost)"
          value={formatProposalCurrencyAmount(totalBonuses, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">C. Benefits</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Benefits (monthly accrual)"
          value={formatProposalCurrencyAmount(p.benefits, currency)}
        />
        <EconRow
          label="Total benefits (loaded into cost)"
          value={formatProposalCurrencyAmount(p.totalBenefits, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">D. Employer load</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Employer load rate (% of gross)"
          value={formatProposalPercent(p.employerLoadPercent)}
        />
        <EconRow
          label="Employer load (IMSS, payroll taxes, statutory — amount)"
          value={formatProposalCurrencyAmount(p.totalEmployerLoad, currency)}
        />
        <EconRow
          label="Employer cost (gross + employer load)"
          value={formatProposalCurrencyAmount(p.employerCost, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">E. Operating expenses</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Operating expenses (monthly)"
          value={formatProposalCurrencyAmount(p.operatingExpenses, currency)}
        />
        <EconRow
          label="Total operating expenses (loaded)"
          value={formatProposalCurrencyAmount(p.totalOperatingExpenses, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">F. Commercial result</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Internal monthly cost (subtotal)"
          value={formatProposalCurrencyAmount(p.subtotal, currency)}
          rowClassName="proposal-doc-divider proposal-doc-strong"
        />
        <EconRow
          label="Target margin on cost (policy %)"
          value={formatProposalPercent(p.marginPercent)}
        />
        <EconRow
          label="Fee before commercial discount"
          value={formatProposalCurrencyAmount(
            p.baseMonthlyRateBeforeDiscount,
            currency,
            0,
          )}
        />
        <EconRow
          label="Commercial discount"
          value={formatProposalPercent(p.discountPercent ?? 0)}
        />
        <EconRow
          label="Final monthly fee (excl. VAT)"
          value={formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0)}
          rowClassName="proposal-doc-strong"
        />
        <EconRow
          label="Gross margin on revenue (amount)"
          value={formatProposalCurrencyAmount(p.grossMarginAmount, currency)}
        />
        <EconRow
          label="Gross margin on revenue (% of fee)"
          value={formatProposalPercent(p.grossMarginPercent)}
        />
        <EconRow
          label="VAT rate (on fee)"
          value={formatProposalPercent(p.vatPercent)}
        />
        <EconRow
          label="Final monthly fee (incl. VAT)"
          value={formatProposalCurrencyAmount(
            p.finalMonthlyRateWithVAT,
            currency,
            0,
          )}
          rowClassName="proposal-doc-strong"
        />
      </EconBlockTable>
    </div>
  );
}

function EconBlockTable({
  currency,
  children,
}: {
  currency: string;
  children: ReactNode;
}) {
  return (
    <table className="proposal-doc-block-table">
      <thead>
        <tr>
          <th>Concept</th>
          <th className="num">Amount ({currency})</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function EconRow({
  label,
  value,
  rowClassName,
}: {
  label: string;
  value: string;
  rowClassName?: string;
}) {
  return (
    <tr className={rowClassName}>
      <td className="text-muted-foreground">{label}</td>
      <td className="num font-medium text-foreground">{value}</td>
    </tr>
  );
}

function ProposalNarrativeSections({
  proposal,
}: {
  proposal: ProposalDetailUi;
}) {
  const blocks: { title: string; body: string | null }[] = [
    { title: "Executive summary", body: proposal.executiveSummary },
    { title: "Profile summary", body: proposal.profileSummary },
    { title: "Scope", body: proposal.scopeNotes },
  ];
  const filled = blocks.filter((b) => b.body?.trim());
  if (filled.length === 0) return null;
  return (
    <section className="mt-8 space-y-6">
      {filled.map((b) => (
        <div key={b.title}>
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            {b.title}
          </h3>
          <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
            {b.body}
          </div>
        </div>
      ))}
    </section>
  );
}
