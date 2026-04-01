"use client";

import * as React from "react";

import {
  CandidateAvailabilityStatus as AvailabilityConst,
  VacancySeniority as SeniorityConst,
  type CandidateAvailabilityStatus,
  type VacancySeniority,
} from "@/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/skills/queries";
import { cn } from "@/lib/utils";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { CandidateSkillDraft } from "@/lib/candidates/validation";

import { CandidateSkillsEditor } from "./candidate-skills-editor";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const AVAILABILITY_LABELS: Record<CandidateAvailabilityStatus, string> = {
  AVAILABLE: "Disponible",
  IN_PROCESS: "En proceso",
  ASSIGNED: "Asignado",
  NOT_AVAILABLE: "No disponible",
};

const SENIORITY_LABELS: Record<VacancySeniority, string> = {
  INTERN: "Interno",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

export function CandidateRecordFormFields({
  skillsCatalog,
  defaults,
  candidateId,
  fieldErrors,
}: {
  skillsCatalog: SkillOption[];
  defaults?: CandidateEditData;
  candidateId?: string;
  fieldErrors?: Record<string, string>;
}) {
  const [structuredSkills, setStructuredSkills] = React.useState<
    CandidateSkillDraft[]
  >(defaults?.structuredSkills ?? []);

  const seniorityOrder = Object.values(SeniorityConst) as VacancySeniority[];
  const availabilityOrder = Object.values(
    AvailabilityConst,
  ) as CandidateAvailabilityStatus[];

  return (
    <div className="grid gap-4">
      {candidateId ? (
        <input type="hidden" name="candidateId" value={candidateId} />
      ) : null}

      <input
        type="hidden"
        name="structuredSkills"
        value={JSON.stringify(structuredSkills)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={candidateId ? `edit-first-${candidateId}` : "new-first"} className="text-sm font-medium">
            First name <span className="text-destructive">*</span>
          </label>
          <Input
            id={candidateId ? `edit-first-${candidateId}` : "new-first"}
            name="firstName"
            required
            maxLength={120}
            defaultValue={defaults?.firstName ?? ""}
            aria-invalid={Boolean(fieldErrors?.firstName)}
          />
          {fieldErrors?.firstName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor={candidateId ? `edit-last-${candidateId}` : "new-last"} className="text-sm font-medium">
            Apellido
          </label>
          <Input
            id={candidateId ? `edit-last-${candidateId}` : "new-last"}
            name="lastName"
            maxLength={120}
            defaultValue={defaults?.lastName ?? ""}
            aria-invalid={Boolean(fieldErrors?.lastName)}
          />
          {fieldErrors?.lastName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={candidateId ? `edit-role-${candidateId}` : "new-role"} className="text-sm font-medium">
          Rol <span className="text-destructive">*</span>
        </label>
        <Input
          id={candidateId ? `edit-role-${candidateId}` : "new-role"}
          name="role"
          required
          maxLength={200}
          defaultValue={defaults?.role ?? ""}
          aria-invalid={Boolean(fieldErrors?.role)}
        />
        {fieldErrors?.role ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.role}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-seniority-${candidateId}` : "new-seniority"}
            className="text-sm font-medium"
          >
            Senioridad <span className="text-destructive">*</span>
          </label>
          <select
            id={candidateId ? `edit-seniority-${candidateId}` : "new-seniority"}
            name="seniority"
            required
            className={selectClass}
            defaultValue={defaults?.seniorityValue ?? "MID"}
            aria-invalid={Boolean(fieldErrors?.seniority)}
          >
            {seniorityOrder.map((v) => (
              <option key={v} value={v}>
                {SENIORITY_LABELS[v]}
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
            htmlFor={candidateId ? `edit-availability-${candidateId}` : "new-availability"}
            className="text-sm font-medium"
          >
            Disponibilidad <span className="text-destructive">*</span>
          </label>
          <select
            id={candidateId ? `edit-availability-${candidateId}` : "new-availability"}
            name="availabilityStatus"
            required
            className={selectClass}
            defaultValue={defaults?.availabilityStatusValue ?? "AVAILABLE"}
            aria-invalid={Boolean(fieldErrors?.availabilityStatus)}
          >
            {availabilityOrder.map((v) => (
              <option key={v} value={v}>
                {AVAILABILITY_LABELS[v]}
              </option>
            ))}
          </select>
          {fieldErrors?.availabilityStatus ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.availabilityStatus}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={candidateId ? `edit-email-${candidateId}` : "new-email"} className="text-sm font-medium">
            Correo
          </label>
          <Input
            id={candidateId ? `edit-email-${candidateId}` : "new-email"}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaults?.email ?? ""}
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          {fieldErrors?.email ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor={candidateId ? `edit-phone-${candidateId}` : "new-phone"} className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id={candidateId ? `edit-phone-${candidateId}` : "new-phone"}
            name="phone"
            defaultValue={defaults?.phone ?? ""}
            aria-invalid={Boolean(fieldErrors?.phone)}
          />
          {fieldErrors?.phone ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={candidateId ? `edit-currentCompany-${candidateId}` : "new-currentCompany"}
          className="text-sm font-medium"
        >
          Empresa actual
        </label>
        <Input
          id={candidateId ? `edit-currentCompany-${candidateId}` : "new-currentCompany"}
          name="currentCompany"
          defaultValue={defaults?.currentCompany ?? ""}
          aria-invalid={Boolean(fieldErrors?.currentCompany)}
        />
        {fieldErrors?.currentCompany ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.currentCompany}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={candidateId ? `edit-notes-${candidateId}` : "new-notes"} className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id={candidateId ? `edit-notes-${candidateId}` : "new-notes"}
          name="notes"
          defaultValue={defaults?.notes ?? ""}
          rows={4}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <CandidateSkillsEditor
        skills={skillsCatalog}
        value={structuredSkills}
        onChange={setStructuredSkills}
        error={fieldErrors?.structuredSkills}
      />
    </div>
  );
}

