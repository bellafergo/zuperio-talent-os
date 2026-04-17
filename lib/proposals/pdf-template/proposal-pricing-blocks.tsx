import type { ReactNode } from "react";

import type { ProposalDetailUi } from "@/lib/proposals/types";
import {
  formatProposalCurrencyAmount,
  formatProposalPercent,
} from "@/lib/proposals/presentation";

export function SimplePricingTable({
  proposal,
  currency,
  variant = "app",
}: {
  proposal: ProposalDetailUi;
  currency: string;
  /** `consulting` uses dedicated PDF CSS (no Tailwind cell classes). */
  variant?: "app" | "consulting";
}) {
  const p = proposal.pricing!;
  const rows: { label: string; value: string }[] = [
    { label: "Esquema de precios", value: p.scheme },
    {
      label: "Tarifa mensual comercial (sin IVA)",
      value: formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0),
    },
    {
      label: "Tarifa mensual indicativa (con IVA)",
      value: formatProposalCurrencyAmount(p.finalMonthlyRateWithVAT, currency, 0),
    },
    {
      label: "Margen bruto",
      value: formatProposalPercent(p.grossMarginPercent),
    },
    {
      label: "Duración estimada (meses)",
      value: String(p.estimatedDurationMonths),
    },
    {
      label: "Vigencia de la propuesta (días)",
      value: String(proposal.validityDays),
    },
  ];
  const tableClass = variant === "consulting" ? "cpdf-data-table" : "mt-3";
  const labelCellClass =
    variant === "consulting" ? undefined : "w-[55%] text-muted-foreground";
  const valueCellClass =
    variant === "consulting" ? "num" : "num font-medium text-foreground";

  return (
    <table className={tableClass}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className={labelCellClass}>{r.label}</td>
            <td className={valueCellClass}>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DetailedPricingTable({
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
        <span className="font-medium text-foreground">Contexto:</span>{" "}
        {p.scheme} · {p.monthlyHours} h/mes · vigencia {proposal.validityDays}{" "}
        días. Los montos son mensuales salvo que se indique lo contrario. Las
        líneas informativas no modifican el cálculo comercial.
      </p>

      <p className="proposal-doc-block-title">A. Base de compensación</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Salario neto (líquido para el candidato)"
          value={formatProposalCurrencyAmount(p.candidateNetSalary, currency)}
        />
        <EconRow
          label="Salario bruto (base nómina)"
          value={formatProposalCurrencyAmount(p.grossSalary, currency)}
        />
        {showEstDeductions ? (
          <EconRow
            label="Deducciones estimadas al empleado (informativo: bruto − neto)"
            value={formatProposalCurrencyAmount(estEmployeeDeductions, currency)}
          />
        ) : null}
      </EconBlockTable>

      <p className="proposal-doc-block-title">B. Bonos</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Bonos (devengo mensual)"
          value={formatProposalCurrencyAmount(p.bonuses, currency)}
        />
        <EconRow
          label="Total bonos (cargado al costo)"
          value={formatProposalCurrencyAmount(totalBonuses, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">C. Prestaciones</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Prestaciones (devengo mensual)"
          value={formatProposalCurrencyAmount(p.benefits, currency)}
        />
        <EconRow
          label="Total prestaciones (cargado al costo)"
          value={formatProposalCurrencyAmount(p.totalBenefits, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">D. Carga patronal</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Tasa de carga patronal (% sobre bruto)"
          value={formatProposalPercent(p.employerLoadPercent)}
        />
        <EconRow
          label="Carga patronal (IMSS, impuestos de nómina, obligatorios — monto)"
          value={formatProposalCurrencyAmount(p.totalEmployerLoad, currency)}
        />
        <EconRow
          label="Costo patronal (bruto + carga)"
          value={formatProposalCurrencyAmount(p.employerCost, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">E. Gastos operativos</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Gastos operativos (mensual)"
          value={formatProposalCurrencyAmount(p.operatingExpenses, currency)}
        />
        <EconRow
          label="Total gastos operativos (cargado)"
          value={formatProposalCurrencyAmount(p.totalOperatingExpenses, currency)}
        />
      </EconBlockTable>

      <p className="proposal-doc-block-title">F. Resultado comercial</p>
      <EconBlockTable currency={currency}>
        <EconRow
          label="Costo mensual interno (subtotal)"
          value={formatProposalCurrencyAmount(p.subtotal, currency)}
          rowClassName="proposal-doc-divider proposal-doc-strong"
        />
        <EconRow
          label="Margen objetivo sobre costo (política %)"
          value={formatProposalPercent(p.marginPercent)}
        />
        <EconRow
          label="Honorario antes de descuento comercial"
          value={formatProposalCurrencyAmount(
            p.baseMonthlyRateBeforeDiscount,
            currency,
            0,
          )}
        />
        <EconRow
          label="Descuento comercial"
          value={formatProposalPercent(p.discountPercent ?? 0)}
        />
        <EconRow
          label="Honorario mensual final (sin IVA)"
          value={formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0)}
          rowClassName="proposal-doc-strong"
        />
        <EconRow
          label="Margen bruto sobre ingresos (monto)"
          value={formatProposalCurrencyAmount(p.grossMarginAmount, currency)}
        />
        <EconRow
          label="Margen bruto sobre ingresos (% del honorario)"
          value={formatProposalPercent(p.grossMarginPercent)}
        />
        <EconRow
          label="Tasa de IVA (sobre honorario)"
          value={formatProposalPercent(p.vatPercent)}
        />
        <EconRow
          label="Honorario mensual final (con IVA)"
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
          <th>Concepto</th>
          <th className="num">Monto ({currency})</th>
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
