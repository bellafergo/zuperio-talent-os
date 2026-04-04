"use client";

import * as React from "react";
import type { RefObject } from "react";

import {
  CandidatePipelineIntent as PipelineIntentConst,
  CandidateRecruitmentStage as RecruitmentStageConst,
  VacancySeniority as SeniorityConst,
  type CandidatePipelineIntent,
  type VacancySeniority,
} from "@/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import type { CvAutofillApplyPayload, CvAutofillProvenanceField } from "@/lib/candidates/cv-autofill-types";
import type { SkillOption } from "@/lib/skills/queries";
import {
  CANDIDATE_RECRUITMENT_STAGE_LABELS,
  CANDIDATE_RECRUITMENT_STAGE_ORDER,
  CANDIDATE_WORK_MODALITY_OPTIONS,
} from "@/lib/candidates/constants";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type {
  CandidateAvailabilityFormMode,
  CandidateSkillDraft,
} from "@/lib/candidates/validation";
import type { OpenVacancyOptionForCandidateForm } from "@/lib/vacancies/queries";
import { cn } from "@/lib/utils";

import { CandidateFormCvSection } from "./candidate-form-cv-section";
import { CandidateSkillsEditor } from "./candidate-skills-editor";

const EMPTY_CV_PATCH: Partial<CandidateEditData> = {};
const EMPTY_CV_SKILLS: CandidateSkillDraft[] = [];

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const SENIORITY_LABELS: Record<VacancySeniority, string> = {
  INTERN: "Interno",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

function CvProvenanceHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="text-[11px] leading-snug text-muted-foreground">Sugerido desde CV</p>
  );
}

function deriveInitialAvailability(defaults?: CandidateEditData): {
  mode: CandidateAvailabilityFormMode;
  specificDate: string;
} {
  if (!defaults) {
    return { mode: "IMMEDIATE", specificDate: "" };
  }
  const status = defaults.availabilityStatusValue;
  if (status === "NOT_AVAILABLE") {
    return { mode: "NOT_AVAILABLE", specificDate: "" };
  }
  if (status === "ASSIGNED") {
    return { mode: "NOT_AVAILABLE", specificDate: "" };
  }
  if (status === "IN_PROCESS") {
    return { mode: "TWO_WEEKS", specificDate: "" };
  }
  if (!defaults.availabilityStartDate) {
    return { mode: "IMMEDIATE", specificDate: "" };
  }
  const dt = defaults.availabilityStartDate;
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return { mode: "SPECIFIC_DATE", specificDate: `${y}-${m}-${d}` };
}

export function CandidateRecordFormFields({
  skillsCatalog,
  defaults,
  candidateId,
  fieldErrors,
  openVacancies = [],
  formResetKey = 0,
  enableCvSection = false,
  autofillFormRef,
  onCvAutofillApplied,
  cvAutofillApplyId = 0,
  cvAutofillPatch = EMPTY_CV_PATCH,
  cvAutofillExtraSkills = EMPTY_CV_SKILLS,
  cvAutofillProvenanceKeys = [],
  cvAutofillSkillsAddedLastApply = 0,
}: {
  skillsCatalog: SkillOption[];
  defaults?: CandidateEditData;
  candidateId?: string;
  fieldErrors?: Record<string, string>;
  /** Safe optional; form still works when empty after a failed load. */
  openVacancies?: OpenVacancyOptionForCandidateForm[];
  /** Bumps when the parent dialog remounts the form (clears autofill merge state). */
  formResetKey?: number;
  enableCvSection?: boolean;
  autofillFormRef?: RefObject<HTMLFormElement | null>;
  onCvAutofillApplied?: (payload: CvAutofillApplyPayload) => void;
  cvAutofillApplyId?: number;
  cvAutofillPatch?: Partial<CandidateEditData>;
  cvAutofillExtraSkills?: CandidateSkillDraft[];
  cvAutofillProvenanceKeys?: readonly CvAutofillProvenanceField[];
  cvAutofillSkillsAddedLastApply?: number;
}) {
  const initialAvail = deriveInitialAvailability(defaults);
  const [availMode, setAvailMode] = React.useState<CandidateAvailabilityFormMode>(
    initialAvail.mode,
  );
  const [availSpecificDate, setAvailSpecificDate] = React.useState(
    initialAvail.specificDate,
  );

  const [pipelineIntent, setPipelineIntent] =
    React.useState<CandidatePipelineIntent>(
      defaults?.pipelineIntentValue ?? PipelineIntentConst.NO_VACANCY,
    );
  const [pipelineVacancyId, setPipelineVacancyId] = React.useState(
    defaults?.pipelineVacancyId ?? "",
  );

  const [structuredSkills, setStructuredSkills] = React.useState<
    CandidateSkillDraft[]
  >(defaults?.structuredSkills ?? []);

  const seniorityOrder = Object.values(SeniorityConst) as VacancySeniority[];

  const m = { ...(defaults ?? {}), ...cvAutofillPatch } as Partial<CandidateEditData>;
  const fieldKey = `${formResetKey}-${cvAutofillApplyId}`;

  const workModalityCurrent = (m.workModality ?? defaults?.workModality ?? "")
    .toString()
    .trim();
  const workModalityLegacy =
    workModalityCurrent &&
    !(CANDIDATE_WORK_MODALITY_OPTIONS as readonly string[]).includes(
      workModalityCurrent,
    )
      ? workModalityCurrent
      : null;

  const provenanceSet = React.useMemo(
    () => new Set(cvAutofillProvenanceKeys),
    [cvAutofillProvenanceKeys],
  );

  const lastSkillAutofillApply = React.useRef(-1);
  React.useEffect(() => {
    lastSkillAutofillApply.current = -1;
  }, [formResetKey]);

  React.useEffect(() => {
    if (cvAutofillApplyId === 0) return;
    if (lastSkillAutofillApply.current === cvAutofillApplyId) return;
    lastSkillAutofillApply.current = cvAutofillApplyId;
    const extra = cvAutofillExtraSkills ?? [];
    if (extra.length === 0) return;
    setStructuredSkills((prev) => {
      const ids = new Set(prev.map((s) => s.skillId));
      const add = extra.filter((s) => !ids.has(s.skillId));
      return [...prev, ...add];
    });
  }, [cvAutofillApplyId, cvAutofillExtraSkills]);

  function onPipelineIntentChange(next: CandidatePipelineIntent) {
    setPipelineIntent(next);
    if (next !== "OPEN_VACANCY") setPipelineVacancyId("");
  }

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
      <input
        type="hidden"
        name="currentCompanyHidden"
        value={m.currentCompany ?? defaults?.currentCompany ?? ""}
      />
      <input type="hidden" name="availabilityMode" value={availMode} />
      <input
        type="hidden"
        name="availabilitySpecificDate"
        value={availMode === "SPECIFIC_DATE" ? availSpecificDate : ""}
      />
      <input type="hidden" name="pipelineIntent" value={pipelineIntent} />
      {pipelineIntent !== "OPEN_VACANCY" ? (
        <input type="hidden" name="pipelineVacancyId" value="" />
      ) : null}

      {enableCvSection && onCvAutofillApplied && autofillFormRef ? (
        <CandidateFormCvSection
          skillsCatalog={skillsCatalog}
          existingCvFileName={defaults?.cvFileName ?? null}
          autofillFormRef={autofillFormRef}
          onAutofillApplied={onCvAutofillApplied}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-first-${candidateId}` : "new-first"}
            className="text-sm font-medium"
          >
            Nombre <span className="text-destructive">*</span>
          </label>
          <CvProvenanceHint show={provenanceSet.has("firstName")} />
          <Input
            key={`firstName-${fieldKey}`}
            id={candidateId ? `edit-first-${candidateId}` : "new-first"}
            name="firstName"
            required
            maxLength={120}
            defaultValue={m.firstName ?? ""}
            aria-invalid={Boolean(fieldErrors?.firstName)}
          />
          {fieldErrors?.firstName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-last-${candidateId}` : "new-last"}
            className="text-sm font-medium"
          >
            Apellido
          </label>
          <CvProvenanceHint show={provenanceSet.has("lastName")} />
          <Input
            key={`lastName-${fieldKey}`}
            id={candidateId ? `edit-last-${candidateId}` : "new-last"}
            name="lastName"
            maxLength={120}
            defaultValue={m.lastName ?? ""}
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
          <label
            htmlFor={candidateId ? `edit-role-${candidateId}` : "new-role"}
            className="text-sm font-medium"
          >
            Rol <span className="text-destructive">*</span>
          </label>
          <CvProvenanceHint show={provenanceSet.has("role")} />
          <Input
            key={`role-${fieldKey}`}
          id={candidateId ? `edit-role-${candidateId}` : "new-role"}
          name="role"
          required
          maxLength={200}
          defaultValue={m.role ?? ""}
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
          <label className="text-sm font-medium">
            Disponibilidad <span className="text-destructive">*</span>
          </label>
          <select
            className={selectClass}
            value={availMode}
            onChange={(e) => {
              const v = e.target.value as CandidateAvailabilityFormMode;
              setAvailMode(v);
              if (v !== "SPECIFIC_DATE") setAvailSpecificDate("");
            }}
            aria-invalid={Boolean(
              fieldErrors?.availabilityMode || fieldErrors?.availabilitySpecificDate,
            )}
          >
            <option value="IMMEDIATE">Inmediata</option>
            <option value="TWO_WEEKS">En 2 semanas</option>
            <option value="SPECIFIC_DATE">Fecha específica</option>
            <option value="NOT_AVAILABLE">No disponible</option>
          </select>
          {fieldErrors?.availabilityMode ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.availabilityMode}
            </p>
          ) : null}
        </div>
      </div>

      {availMode === "SPECIFIC_DATE" ? (
        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-avail-date-${candidateId}` : "new-avail-date"}
            className="text-sm font-medium"
          >
            Fecha disponible <span className="text-destructive">*</span>
          </label>
          <Input
            id={candidateId ? `edit-avail-date-${candidateId}` : "new-avail-date"}
            type="date"
            value={availSpecificDate}
            onChange={(e) => setAvailSpecificDate(e.target.value)}
            className={selectClass}
            aria-invalid={Boolean(fieldErrors?.availabilitySpecificDate)}
          />
          {fieldErrors?.availabilitySpecificDate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.availabilitySpecificDate}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Contexto de reclutamiento <span className="text-destructive">*</span>
        </label>
        <select
          className={selectClass}
          value={pipelineIntent}
          onChange={(e) =>
            onPipelineIntentChange(e.target.value as CandidatePipelineIntent)
          }
          aria-invalid={Boolean(fieldErrors?.pipelineIntent)}
        >
          <option value={PipelineIntentConst.OPEN_VACANCY}>Vacante abierta</option>
          <option value={PipelineIntentConst.NO_VACANCY}>Sin vacante definida</option>
          <option value={PipelineIntentConst.TALENT_POOL}>Pool de talento</option>
        </select>
        {fieldErrors?.pipelineIntent ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.pipelineIntent}
          </p>
        ) : null}
      </div>

      {pipelineIntent === "OPEN_VACANCY" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Vacante <span className="text-destructive">*</span>
          </label>
          <select
            name="pipelineVacancyId"
            className={selectClass}
            value={pipelineVacancyId}
            onChange={(e) => setPipelineVacancyId(e.target.value)}
            aria-invalid={Boolean(fieldErrors?.pipelineVacancyId)}
          >
            <option value="" disabled>
              Selecciona una vacante…
            </option>
            {defaults?.pipelineVacancyId &&
            !openVacancies.some((v) => v.id === defaults.pipelineVacancyId) ? (
              <option value={defaults.pipelineVacancyId}>
                Vacante guardada (puede estar cerrada)
              </option>
            ) : null}
            {openVacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
          {openVacancies.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No se cargaron vacantes abiertas. Puedes guardar con otro contexto o
              reintentar más tarde.
            </p>
          ) : null}
          {fieldErrors?.pipelineVacancyId ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.pipelineVacancyId}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor={candidateId ? `edit-stage-${candidateId}` : "new-stage"}
          className="text-sm font-medium"
        >
          Etapa del proceso
        </label>
        <select
          id={candidateId ? `edit-stage-${candidateId}` : "new-stage"}
          key={`recruitmentStage-${fieldKey}`}
          name="recruitmentStage"
          className={selectClass}
          defaultValue={
            defaults?.recruitmentStageValue ?? RecruitmentStageConst.NUEVO
          }
          aria-invalid={Boolean(fieldErrors?.recruitmentStage)}
        >
          {CANDIDATE_RECRUITMENT_STAGE_ORDER.map((v) => (
            <option key={v} value={v}>
              {CANDIDATE_RECRUITMENT_STAGE_LABELS[v]}
            </option>
          ))}
        </select>
        {fieldErrors?.recruitmentStage ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.recruitmentStage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-email-${candidateId}` : "new-email"}
            className="text-sm font-medium"
          >
            Correo
          </label>
          <CvProvenanceHint show={provenanceSet.has("email")} />
          <Input
            key={`email-${fieldKey}`}
            id={candidateId ? `edit-email-${candidateId}` : "new-email"}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={m.email ?? ""}
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          {fieldErrors?.email ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={candidateId ? `edit-phone-${candidateId}` : "new-phone"}
            className="text-sm font-medium"
          >
            Teléfono
          </label>
          <CvProvenanceHint show={provenanceSet.has("phone")} />
          <Input
            key={`phone-${fieldKey}`}
            id={candidateId ? `edit-phone-${candidateId}` : "new-phone"}
            name="phone"
            defaultValue={m.phone ?? ""}
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
        <label htmlFor={candidateId ? `edit-notes-${candidateId}` : "new-notes"} className="text-sm font-medium">
          Notas
        </label>
        <CvProvenanceHint show={provenanceSet.has("notes")} />
        <textarea
          key={`notes-${fieldKey}`}
          id={candidateId ? `edit-notes-${candidateId}` : "new-notes"}
          name="notes"
          defaultValue={m.notes ?? ""}
          rows={4}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
        <div>
          <p className="text-sm font-medium">Perfil para CV PDF (opcional)</p>
          <p className="text-xs text-muted-foreground">
            Alimenta la plantilla de CV comercial. Idiomas: una línea por idioma, p. ej.{" "}
            <span className="font-mono text-[11px]">Español — Nativo</span>. Industrias:
            separadas por coma.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={candidateId ? `edit-loc-${candidateId}` : "new-loc"}
              className="text-xs font-medium text-muted-foreground"
            >
              Ubicación (ciudad / país)
            </label>
            <CvProvenanceHint show={provenanceSet.has("locationCity")} />
            <Input
              key={`locationCity-${fieldKey}`}
              id={candidateId ? `edit-loc-${candidateId}` : "new-loc"}
              name="locationCity"
              maxLength={200}
              defaultValue={m.locationCity ?? ""}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={candidateId ? `edit-mod-${candidateId}` : "new-mod"}
              className="text-xs font-medium text-muted-foreground"
            >
              Modalidad
            </label>
            <CvProvenanceHint show={provenanceSet.has("workModality")} />
            <select
              key={`workModality-${fieldKey}`}
              id={candidateId ? `edit-mod-${candidateId}` : "new-mod"}
              name="workModality"
              className={selectClass}
              defaultValue={
                workModalityLegacy
                  ? workModalityLegacy
                  : workModalityCurrent || ""
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
        </div>
        {(
          [
            ["cvLanguagesText", "Idiomas (líneas)", m.cvLanguagesText],
            ["cvCertificationsText", "Certificaciones (líneas)", m.cvCertificationsText],
            ["cvIndustriesText", "Industrias (coma)", m.cvIndustriesText],
            ["cvEducationText", "Educación (párrafos o líneas)", m.cvEducationText],
            [
              "cvWorkExperienceText",
              "Experiencia laboral (texto del CV)",
              m.cvWorkExperienceText,
            ],
            ["cvSoftSkillsText", "Habilidades blandas (CV, una por línea)", m.cvSoftSkillsText],
          ] as const
        ).map(([name, label, val]) => (
          <div key={name} className="space-y-2">
            <label htmlFor={`${candidateId ?? "new"}-${name}`} className="text-xs font-medium text-muted-foreground">
              {label}
            </label>
            <CvProvenanceHint show={provenanceSet.has(name as CvAutofillProvenanceField)} />
            <textarea
              key={`${name}-${fieldKey}`}
              id={`${candidateId ?? "new"}-${name}`}
              name={name}
              defaultValue={val ?? ""}
              rows={
                name === "cvWorkExperienceText"
                  ? 6
                  : name === "cvEducationText" || name === "cvSoftSkillsText"
                    ? 4
                    : 3
              }
              className={cn(
                "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "dark:bg-input/30",
              )}
              aria-invalid={Boolean(fieldErrors?.[name])}
            />
            {fieldErrors?.[name] ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors[name]}
              </p>
            ) : null}
          </div>
        ))}
        <textarea
          key={`cvRawText-${fieldKey}`}
          name="cvRawText"
          defaultValue={m.cvRawText ?? ""}
          hidden
          readOnly
          aria-hidden
          tabIndex={-1}
          className="hidden"
        />
      </div>

      {cvAutofillSkillsAddedLastApply > 0 ? (
        <p className="text-xs text-muted-foreground">
          En la última sugerencia se añadieron {cvAutofillSkillsAddedLastApply} competencia(s) desde
          el CV; revisa la lista antes de guardar.
        </p>
      ) : null}
      <CandidateSkillsEditor
        skills={skillsCatalog}
        value={structuredSkills}
        onChange={setStructuredSkills}
        error={fieldErrors?.structuredSkills}
      />
    </div>
  );
}
