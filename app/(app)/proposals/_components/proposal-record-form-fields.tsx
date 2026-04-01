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
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed (tracking)",
  IN_NEGOTIATION: "In negotiation",
  WON: "Won",
  LOST: "Lost",
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
  SIMPLE: "Simple proposal (1-page)",
  DETAILED: "Detailed proposal (breakdown)",
};

const SCHEME_LABELS: Record<PricingScheme, string> = {
  MIXED: "Mixed",
  FULL_IMSS: "Full IMSS",
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
            Company <span className="text-destructive">*</span>
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
              Select a company…
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
          <label className="text-sm font-medium">Opportunity</label>
          <select
            name="opportunityId"
            className={selectClass}
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
            aria-invalid={Boolean(fieldErrors?.opportunityId)}
          >
            <option value="">No opportunity</option>
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
          <label className="text-sm font-medium">Vacancy</label>
          <select
            name="vacancyId"
            className={selectClass}
            defaultValue={defaults?.vacancyId ?? ""}
            aria-invalid={Boolean(fieldErrors?.vacancyId)}
          >
            <option value="">No vacancy</option>
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
          <label className="text-sm font-medium">Candidate</label>
          <select
            name="candidateId"
            className={selectClass}
            defaultValue={defaults?.candidateId ?? ""}
            aria-invalid={Boolean(fieldErrors?.candidateId)}
          >
            <option value="">No candidate</option>
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
            Type <span className="text-destructive">*</span>
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
            Status <span className="text-destructive">*</span>
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
        <label className="text-sm font-medium">Proposal format</label>
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
          <label className="text-sm font-medium">Currency</label>
          <Input
            name="currency"
            maxLength={3}
            placeholder="EUR"
            defaultValue={defaults?.currency ?? "EUR"}
            aria-invalid={Boolean(fieldErrors?.currency)}
          />
          {fieldErrors?.currency ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.currency}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Validity (days)</label>
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
        <p className="text-sm font-medium text-foreground">Pricing inputs</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Deterministic and auditable. Choose scheme, set margin/load/expenses, then save
          to compute final rates and margin.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pricing scheme</label>
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
              Monthly hours <span className="text-destructive">*</span>
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
            <label className="text-sm font-medium">Margin percent</label>
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
            <label className="text-sm font-medium">Employer load percent (IMSS)</label>
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
            <label className="text-sm font-medium">Estimated duration (months)</label>
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
            <label className="text-sm font-medium">Candidate net salary (monthly)</label>
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
            <label className="text-sm font-medium">Bonuses (monthly)</label>
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
            <label className="text-sm font-medium">Benefits (monthly)</label>
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
            <label className="text-sm font-medium">Operating expenses (monthly)</label>
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
            <label className="text-sm font-medium">Discount percent</label>
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Executive summary</label>
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
        <label className="text-sm font-medium">Profile summary</label>
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
        <label className="text-sm font-medium">Scope notes</label>
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
        <label className="text-sm font-medium">Commercial notes</label>
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

