"use client";

import * as React from "react";

import {
  PricingScheme as SchemeConst,
  ProposalStatus as StatusConst,
  ProposalFormat as FormatConst,
  ProposalType as TypeConst,
  type PricingScheme,
  type ProposalFormat,
  type ProposalStatus,
  type ProposalType,
} from "@/generated/prisma/enums";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";
import { cn } from "@/lib/utils";

import { CurrencySelect } from "@/components/currency-select";
import { Input } from "@/components/ui/input";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const TYPE_LABELS: Record<ProposalType, string> = {
  STAFF_AUG: "Staff augmentation",
};

const STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Vista (seguimiento)",
  IN_NEGOTIATION: "En negociación",
  WON: "Ganada",
  LOST: "Pérdida",
};

const STATUS_FIELD_ORDER: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "IN_NEGOTIATION",
  "WON",
  "LOST",
];

const FORMAT_LABELS: Record<ProposalFormat, string> = {
  SIMPLE: "Propuesta simple (1 página)",
  DETAILED: "Propuesta detallada (con desglose)",
};

const SCHEME_LABELS: Record<PricingScheme, string> = {
  MIXED: "Mixto",
  FULL_IMSS: "IMSS completo",
};

export type ProposalFormDefaults = {
  companyId: string;
  opportunityId: string | null;
  vacancyId: string | null;
  candidateId: string | null;
  typeValue: ProposalType;
  formatValue: ProposalFormat;
  statusValue: ProposalStatus;
  currency: string;
  validityDays: number;
  executiveSummary: string;
  profileSummary: string;
  scopeNotes: string;
  commercialNotes: string;
  monthlyHours: number;
  candidateNetSalary: number | null;
  schemeValue: PricingScheme;
  marginPercent: number | null;
  employerLoadPercent: number | null;
  bonuses: number | null;
  benefits: number | null;
  operatingExpenses: number | null;
  discountPercent: number | null;
  estimatedDurationMonths: number;
  /** Null/omit → server uses `pricingConfig.defaultVatPercent`. */
  vatPercent?: number | null;
  /** Null/omit → server uses `pricingConfig.defaultFullImssGrossFactor` when scheme is FULL_IMSS. */
  fullImssGrossFactor?: number | null;
};

export function ProposalRecordFormFields({
  proposalId,
  companies,
  opportunities,
  vacancies,
  candidates,
  defaults,
  fieldErrors,
}: {
  proposalId?: string;
  companies: ProposalCompanyOption[];
  opportunities: ProposalOpportunityOption[];
  vacancies: ProposalVacancyOption[];
  candidates: ProposalCandidateOption[];
  defaults?: ProposalFormDefaults;
  fieldErrors?: Record<string, string>;
}) {
  const typeOrder = Object.values(TypeConst) as ProposalType[];
  const formatOrder = Object.values(FormatConst) as ProposalFormat[];
  const statusOrder = STATUS_FIELD_ORDER.filter((s) =>
    (Object.values(StatusConst) as string[]).includes(s),
  );
  const schemeOrder = Object.values(SchemeConst) as PricingScheme[];

  const [companyId, setCompanyId] = React.useState(defaults?.companyId ?? "");
  const [opportunityId, setOpportunityId] = React.useState(defaults?.opportunityId ?? "");

  const filteredOpps = React.useMemo(
    () => opportunities.filter((o) => !companyId || o.companyId === companyId),
    [opportunities, companyId],
  );
  const filteredVacancies = React.useMemo(
    () =>
      vacancies.filter((v) => {
        if (companyId && v.companyId !== companyId) return false;
        if (opportunityId && v.opportunityId !== opportunityId) return false;
        return true;
      }),
    [vacancies, companyId, opportunityId],
  );

  return (
    <div className="grid gap-4">
      {proposalId ? <input type="hidden" name="proposalId" value={proposalId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Empresa <span className="text-destructive">*</span>
          </label>
          <select
            name="companyId"
            required
            className={selectClass}
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setOpportunityId("");
            }}
            aria-invalid={Boolean(fieldErrors?.companyId)}
          >
            <option value="" disabled>
              Selecciona una empresa…
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors?.companyId ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.companyId}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Oportunidad</label>
          <select
            name="opportunityId"
            className={selectClass}
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
            aria-invalid={Boolean(fieldErrors?.opportunityId)}
          >
            <option value="">Sin oportunidad</option>
            {filteredOpps.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
          {fieldErrors?.opportunityId ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.opportunityId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Vacante</label>
          <select
            name="vacancyId"
            className={selectClass}
            defaultValue={defaults?.vacancyId ?? ""}
            aria-invalid={Boolean(fieldErrors?.vacancyId)}
          >
            <option value="">Sin vacante</option>
            {filteredVacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
          {fieldErrors?.vacancyId ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.vacancyId}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Candidato</label>
          <select
            name="candidateId"
            className={selectClass}
            defaultValue={defaults?.candidateId ?? ""}
            aria-invalid={Boolean(fieldErrors?.candidateId)}
          >
            <option value="">Sin candidato</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors?.candidateId ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.candidateId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tipo <span className="text-destructive">*</span>
          </label>
          <select
            name="type"
            required
            className={selectClass}
            defaultValue={defaults?.typeValue ?? "STAFF_AUG"}
            aria-invalid={Boolean(fieldErrors?.type)}
          >
            {typeOrder.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {fieldErrors?.type ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.type}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Estado <span className="text-destructive">*</span>
          </label>
          <select
            name="status"
            required
            className={selectClass}
            defaultValue={defaults?.statusValue ?? "DRAFT"}
            aria-invalid={Boolean(fieldErrors?.status)}
          >
            {statusOrder.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {fieldErrors?.status ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.status}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Formato de propuesta</label>
        <select
          name="format"
          className={selectClass}
          defaultValue={defaults?.formatValue ?? "SIMPLE"}
          aria-invalid={Boolean(fieldErrors?.format)}
        >
          {formatOrder.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
        {fieldErrors?.format ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.format}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Moneda</label>
          <CurrencySelect
            defaultValue={defaults?.currency ?? "MXN"}
            aria-invalid={Boolean(fieldErrors?.currency)}
          />
          {fieldErrors?.currency ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.currency}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Vigencia (días)</label>
          <Input
            name="validityDays"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            step={1}
            defaultValue={defaults?.validityDays ?? 14}
            aria-invalid={Boolean(fieldErrors?.validityDays)}
          />
          {fieldErrors?.validityDays ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.validityDays}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm ring-1 ring-foreground/5">
        <p className="text-sm font-medium text-foreground">Datos económicos</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Determinista y auditable. Elige esquema, establece margen/carga/gastos
          y guarda para calcular tarifas y margen.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Esquema de precios</label>
            <select
              name="scheme"
              className={selectClass}
              defaultValue={defaults?.schemeValue ?? "MIXED"}
              aria-invalid={Boolean(fieldErrors?.scheme)}
            >
              {schemeOrder.map((s) => (
                <option key={s} value={s}>
                  {SCHEME_LABELS[s]}
                </option>
              ))}
            </select>
            {fieldErrors?.scheme ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.scheme}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Horas mensuales <span className="text-destructive">*</span>
            </label>
            <Input
              name="monthlyHours"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              defaultValue={defaults?.monthlyHours ?? 160}
              aria-invalid={Boolean(fieldErrors?.monthlyHours)}
            />
            {fieldErrors?.monthlyHours ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.monthlyHours}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Margen (%)</label>
            <Input
              name="marginPercent"
              type="number"
              inputMode="decimal"
              min={0}
              max={95}
              step={0.1}
              defaultValue={defaults?.marginPercent ?? ""}
              aria-invalid={Boolean(fieldErrors?.marginPercent)}
            />
            {fieldErrors?.marginPercent ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.marginPercent}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Carga patronal % (IMSS)</label>
            <Input
              name="employerLoadPercent"
              type="number"
              inputMode="decimal"
              min={0}
              max={200}
              step={0.1}
              defaultValue={defaults?.employerLoadPercent ?? ""}
              aria-invalid={Boolean(fieldErrors?.employerLoadPercent)}
            />
            {fieldErrors?.employerLoadPercent ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.employerLoadPercent}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duración estimada (meses)</label>
            <Input
              name="estimatedDurationMonths"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              step={1}
              defaultValue={defaults?.estimatedDurationMonths ?? 6}
              aria-invalid={Boolean(fieldErrors?.estimatedDurationMonths)}
            />
            {fieldErrors?.estimatedDurationMonths ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.estimatedDurationMonths}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Salario neto del candidato (mensual)</label>
            <Input
              name="candidateNetSalary"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              defaultValue={defaults?.candidateNetSalary ?? ""}
              aria-invalid={Boolean(fieldErrors?.candidateNetSalary)}
            />
            {fieldErrors?.candidateNetSalary ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.candidateNetSalary}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bonos (mensual)</label>
            <Input
              name="bonuses"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              defaultValue={defaults?.bonuses ?? ""}
              aria-invalid={Boolean(fieldErrors?.bonuses)}
            />
            {fieldErrors?.bonuses ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.bonuses}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prestaciones (mensual)</label>
            <Input
              name="benefits"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              defaultValue={defaults?.benefits ?? ""}
              aria-invalid={Boolean(fieldErrors?.benefits)}
            />
            {fieldErrors?.benefits ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.benefits}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gastos operativos (mensual)</label>
            <Input
              name="operatingExpenses"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              defaultValue={defaults?.operatingExpenses ?? ""}
              aria-invalid={Boolean(fieldErrors?.operatingExpenses)}
            />
            {fieldErrors?.operatingExpenses ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.operatingExpenses}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descuento (%)</label>
            <Input
              name="discountPercent"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              defaultValue={defaults?.discountPercent ?? ""}
              aria-invalid={Boolean(fieldErrors?.discountPercent)}
            />
            {fieldErrors?.discountPercent ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.discountPercent}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <input
        type="hidden"
        name="vatPercent"
        defaultValue={
          defaults?.vatPercent != null ? String(defaults.vatPercent) : ""
        }
      />
      <input
        type="hidden"
        name="fullImssGrossFactor"
        defaultValue={
          defaults?.fullImssGrossFactor != null
            ? String(defaults.fullImssGrossFactor)
            : ""
        }
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Resumen ejecutivo</label>
        <textarea
          name="executiveSummary"
          defaultValue={defaults?.executiveSummary ?? ""}
          rows={3}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Perfil del candidato</label>
        <textarea
          name="profileSummary"
          defaultValue={defaults?.profileSummary ?? ""}
          rows={3}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Alcance y próximos pasos</label>
        <textarea
          name="scopeNotes"
          defaultValue={defaults?.scopeNotes ?? ""}
          rows={3}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notas comerciales</label>
        <textarea
          name="commercialNotes"
          defaultValue={defaults?.commercialNotes ?? ""}
          rows={3}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>
    </div>
  );
}

