"use client";

import * as React from "react";

import {
  VacancySeniority as VacancySeniorityConst,
  VacancyStatus as VacancyStatusConst,
  type VacancySeniority,
  type VacancyStatus,
} from "@/generated/prisma/enums";
import { CANDIDATE_WORK_MODALITY_OPTIONS } from "@/lib/candidates/constants";
import type { SkillOption } from "@/lib/skills/queries";
import type {
  CompanyOption,
  VacancyListRow,
  VacancyRequirementDraft,
} from "@/lib/vacancies/types";
import { cn } from "@/lib/utils";

import { CurrencySelect } from "@/components/currency-select";
import { Input } from "@/components/ui/input";
import { VacancyRequirementsEditor } from "./vacancy-requirements-editor";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STATUS_LABELS: Record<VacancyStatus, string> = {
  DRAFT: "Borrador",
  OPEN: "Abierta",
  ON_HOLD: "En pausa",
  SOURCING: "Sourcing",
  INTERVIEWING: "En entrevistas",
  FILLED: "Cubiertas",
  CANCELLED: "Cancelada",
};

const SENIORITY_LABELS: Record<VacancySeniority, string> = {
  INTERN: "Interno",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

export type OpportunityOptionForForm = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
};

type Defaults = {
  title: string;
  companyId: string;
  opportunityId: string | null;
  seniorityValue: VacancyListRow["seniorityValue"];
  statusValue: VacancyListRow["statusValue"];
  targetRateAmount: number | null;
  currency: string;
  roleSummaryLine: string | null;
  workModality: string | null;
  requirements: VacancyRequirementDraft[];
};

export function VacancyRecordFormFields({
  companies,
  opportunities,
  skills,
  defaults,
  vacancyId,
  fieldErrors,
}: {
  companies: CompanyOption[];
  opportunities: OpportunityOptionForForm[];
  skills: SkillOption[];
  defaults?: Defaults;
  vacancyId?: string;
  fieldErrors?: Record<string, string>;
}) {
  const [requirements, setRequirements] = useStateWithDefault(
    defaults?.requirements ?? [],
  );

  const statusOrder = Object.values(VacancyStatusConst) as VacancyStatus[];
  const seniorityOrder = Object.values(VacancySeniorityConst) as VacancySeniority[];

  const workModalityCurrent = (defaults?.workModality ?? "").trim();
  const workModalityLegacy =
    workModalityCurrent &&
    !(CANDIDATE_WORK_MODALITY_OPTIONS as readonly string[]).includes(
      workModalityCurrent,
    )
      ? workModalityCurrent
      : null;

  return (
    <div className="grid gap-4">
      {vacancyId ? (
        <input type="hidden" name="vacancyId" value={vacancyId} />
      ) : null}

      <input
        type="hidden"
        name="requirements"
        value={JSON.stringify(requirements)}
      />

      <div className="space-y-2">
        <label
          htmlFor={vacancyId ? `edit-title-${vacancyId}` : "new-title"}
          className="text-sm font-medium"
        >
          Título <span className="text-destructive">*</span>
        </label>
        <Input
          id={vacancyId ? `edit-title-${vacancyId}` : "new-title"}
          name="title"
          required
          maxLength={200}
          defaultValue={defaults?.title ?? ""}
          aria-invalid={Boolean(fieldErrors?.title)}
        />
        {fieldErrors?.title ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={vacancyId ? `edit-company-${vacancyId}` : "new-company"}
          className="text-sm font-medium"
        >
          Empresa <span className="text-destructive">*</span>
        </label>
        <select
          id={vacancyId ? `edit-company-${vacancyId}` : "new-company"}
          name="companyId"
          required
          className={selectClass}
          defaultValue={defaults?.companyId ?? ""}
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
        <label
          htmlFor={vacancyId ? `edit-opportunity-${vacancyId}` : "new-opportunity"}
          className="text-sm font-medium"
        >
          Oportunidad <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <select
          id={vacancyId ? `edit-opportunity-${vacancyId}` : "new-opportunity"}
          name="opportunityId"
          className={selectClass}
          defaultValue={defaults?.opportunityId ?? ""}
          aria-invalid={Boolean(fieldErrors?.opportunityId)}
        >
          <option value="">Ninguna</option>
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.companyName} — {o.title}
            </option>
          ))}
        </select>
        {fieldErrors?.opportunityId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.opportunityId}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={vacancyId ? `edit-seniority-${vacancyId}` : "new-seniority"}
            className="text-sm font-medium"
          >
            Senioridad <span className="text-destructive">*</span>
          </label>
          <select
            id={vacancyId ? `edit-seniority-${vacancyId}` : "new-seniority"}
            name="seniority"
            required
            className={selectClass}
            defaultValue={defaults?.seniorityValue ?? "MID"}
            aria-invalid={Boolean(fieldErrors?.seniority)}
          >
            {seniorityOrder.map((value) => (
              <option key={value} value={value}>
                {SENIORITY_LABELS[value]}
              </option>
            ))}
          </select>
          {fieldErrors?.seniority ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.seniority}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={vacancyId ? `edit-status-${vacancyId}` : "new-status"}
            className="text-sm font-medium"
          >
            Estado <span className="text-destructive">*</span>
          </label>
          <select
            id={vacancyId ? `edit-status-${vacancyId}` : "new-status"}
            name="status"
            required
            className={selectClass}
            defaultValue={defaults?.statusValue ?? "OPEN"}
            aria-invalid={Boolean(fieldErrors?.status)}
          >
            {statusOrder.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={vacancyId ? `edit-rate-${vacancyId}` : "new-rate"}
            className="text-sm font-medium"
          >
            Tarifa objetivo
          </label>
          <Input
            id={vacancyId ? `edit-rate-${vacancyId}` : "new-rate"}
            name="targetRate"
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            defaultValue={
              defaults?.targetRateAmount != null ? String(defaults.targetRateAmount) : ""
            }
            aria-invalid={Boolean(fieldErrors?.targetRate)}
          />
          {fieldErrors?.targetRate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.targetRate}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={vacancyId ? `edit-currency-${vacancyId}` : "new-currency"}
            className="text-sm font-medium"
          >
            Moneda
          </label>
          <CurrencySelect
            id={vacancyId ? `edit-currency-${vacancyId}` : "new-currency"}
            defaultValue={defaults?.currency ?? "MXN"}
            aria-invalid={Boolean(fieldErrors?.currency)}
          />
          {fieldErrors?.currency ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.currency}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={vacancyId ? `edit-roleSummary-${vacancyId}` : "new-roleSummary"}
          className="text-sm font-medium"
        >
          Alcance del rol (provisional)
        </label>
        <Input
          id={vacancyId ? `edit-roleSummary-${vacancyId}` : "new-roleSummary"}
          name="roleSummary"
          maxLength={400}
          defaultValue={defaults?.roleSummaryLine ?? ""}
          aria-invalid={Boolean(fieldErrors?.roleSummary)}
        />
        {fieldErrors?.roleSummary ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.roleSummary}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={vacancyId ? `edit-modality-${vacancyId}` : "new-modality"}
          className="text-sm font-medium"
        >
          Modalidad de trabajo
        </label>
        <select
          id={vacancyId ? `edit-modality-${vacancyId}` : "new-modality"}
          name="workModality"
          className={selectClass}
          defaultValue={
            workModalityLegacy ? workModalityLegacy : workModalityCurrent || ""
          }
          aria-invalid={Boolean(fieldErrors?.workModality)}
        >
          <option value="">Sin especificar</option>
          {CANDIDATE_WORK_MODALITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {workModalityLegacy ? (
            <option value={workModalityLegacy}>
              {workModalityLegacy} (valor actual)
            </option>
          ) : null}
        </select>
        {fieldErrors?.workModality ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.workModality}
          </p>
        ) : null}
      </div>

      <VacancyRequirementsEditor
        skills={skills}
        value={requirements}
        onChange={setRequirements}
        error={fieldErrors?.requirements}
      />
    </div>
  );
}

function useStateWithDefault<T>(defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = React.useState<T>(defaultValue);
  return [state, setState];
}
