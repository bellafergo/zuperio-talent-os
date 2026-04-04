"use client";

import { FileTextIcon, SparklesIcon } from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CvAutofillApplyPayload,
  CvAutofillProvenanceField,
  CvAutofillSuggestions,
  CvExtractionSummary,
} from "@/lib/candidates/cv-autofill-types";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { CandidateSkillDraft } from "@/lib/candidates/validation";
import type { SkillOption } from "@/lib/skills/queries";
import { cn } from "@/lib/utils";
import { CV_RAW_TEXT_MAX, CV_WORK_EXPERIENCE_FIELD_MAX } from "@/lib/candidates/cv-text-limits";

/**
 * Profile fields that may be filled or overwritten from the uploaded CV.
 * Excludes recruiting/pipeline/availability and internal notes.
 */
const CV_DERIVED_AUTOFILL_FIELD_NAMES = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "role",
  "locationCity",
  "workModality",
  "cvLanguagesText",
  "cvCertificationsText",
  "cvEducationText",
  "cvSoftSkillsText",
  "cvIndustriesText",
  "cvWorkExperienceText",
  "cvRawText",
] as const satisfies readonly CvAutofillProvenanceField[];

function readFormControlValue(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!el) return "";
  if (el instanceof RadioNodeList) {
    const first = el[0];
    if (first && "value" in first) {
      return String((first as HTMLInputElement).value ?? "");
    }
    return "";
  }
  if ("value" in el) {
    return String((el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value ?? "");
  }
  return "";
}

function parseStructuredSkillsFromForm(form: HTMLFormElement | null): CandidateSkillDraft[] {
  if (!form) return [];
  const raw = readFormControlValue(form, "structuredSkills");
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CandidateSkillDraft =>
        x != null &&
        typeof x === "object" &&
        "skillId" in x &&
        typeof (x as CandidateSkillDraft).skillId === "string",
    );
  } catch {
    return [];
  }
}

/** Maps extraction to patch keys we are allowed to touch (never notes / recruiting fields). */
function suggestionsToCvDerivedPatch(s: CvAutofillSuggestions): Partial<CandidateEditData> {
  const patch: Partial<CandidateEditData> = {};
  if (s.firstName?.trim()) patch.firstName = s.firstName.trim().slice(0, 120);
  if (s.lastName?.trim()) patch.lastName = s.lastName.trim().slice(0, 120);
  if (s.email?.trim()) patch.email = s.email.trim().toLowerCase();
  if (s.phone?.trim()) patch.phone = s.phone.trim().slice(0, 80);
  if (s.role?.trim()) patch.role = s.role.trim().slice(0, 200);
  if (s.locationCity?.trim()) patch.locationCity = s.locationCity.trim().slice(0, 200);
  if (s.workModality?.trim()) patch.workModality = s.workModality.trim().slice(0, 120);
  if (s.cvLanguagesText?.trim()) patch.cvLanguagesText = s.cvLanguagesText.trim();
  if (s.cvCertificationsText?.trim()) patch.cvCertificationsText = s.cvCertificationsText.trim();
  if (s.cvEducationText?.trim()) patch.cvEducationText = s.cvEducationText.trim();
  if (s.cvSoftSkillsText?.trim()) {
    patch.cvSoftSkillsText = s.cvSoftSkillsText.trim().slice(0, 6000);
  }
  if (s.cvIndustriesText?.trim()) {
    patch.cvIndustriesText = s.cvIndustriesText.trim().slice(0, 6000);
  }
  if (s.cvWorkExperienceText?.trim()) {
    patch.cvWorkExperienceText = s.cvWorkExperienceText
      .trim()
      .slice(0, CV_WORK_EXPERIENCE_FIELD_MAX);
  }
  if (s.cvRawText?.trim()) {
    patch.cvRawText = s.cvRawText.trim().slice(0, CV_RAW_TEXT_MAX);
  }
  return patch;
}

function patchProvenanceKeys(patch: Partial<CandidateEditData>): CvAutofillProvenanceField[] {
  const out: CvAutofillProvenanceField[] = [];
  for (const key of CV_DERIVED_AUTOFILL_FIELD_NAMES) {
    if (key in patch && patch[key] !== undefined && patch[key] !== null) {
      out.push(key);
    }
  }
  return out;
}

function countSkillTokens(line: string | undefined): number {
  if (!line?.trim()) return 0;
  return line
    .split(/[,;·|]/)
    .map((x) => x.trim())
    .filter(Boolean).length;
}

function countNonEmptyLines(text: string | undefined): number {
  if (!text?.trim()) return 0;
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}

function buildExtractionSummary(
  s: CvAutofillSuggestions,
  skillsTokensDetected: number,
  skillsCatalogMatches: number,
): CvExtractionSummary {
  const fn = s.firstName?.trim() ?? "";
  const ln = s.lastName?.trim() ?? "";
  const displayName = [fn, ln].filter(Boolean).join(" ") || null;
  return {
    displayName,
    email: s.email?.trim() || null,
    phone: s.phone?.trim() || null,
    role: s.role?.trim() || null,
    skillsTokensDetected,
    skillsCatalogMatches,
    languageLinesDetected: countNonEmptyLines(s.cvLanguagesText),
    certificationLinesDetected: countNonEmptyLines(s.cvCertificationsText),
  };
}

function matchSkillsFromLine(
  line: string | undefined,
  catalog: SkillOption[],
): CandidateSkillDraft[] {
  if (!line?.trim()) return [];
  const parts = line
    .split(/[,;·|]/)
    .map((x) => x.trim())
    .filter(Boolean);
  const out: CandidateSkillDraft[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const m = catalog.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (m && !seen.has(m.id)) {
      seen.add(m.id);
      out.push({ skillId: m.id, yearsExperience: null, level: null });
    }
  }
  return out;
}

function hasCvDerivedTextOverwriteConflict(
  form: HTMLFormElement | null,
  patch: Partial<CandidateEditData>,
): boolean {
  if (!form) return false;
  for (const key of CV_DERIVED_AUTOFILL_FIELD_NAMES) {
    if (!(key in patch)) continue;
    const next = patch[key];
    if (typeof next !== "string" || !next.trim()) continue;
    const current = readFormControlValue(form, key);
    if (current.trim()) return true;
  }
  return false;
}

function needsReapplyConfirmation(args: {
  isReapply: boolean;
  applyValues: boolean;
  form: HTMLFormElement | null;
  patch: Partial<CandidateEditData>;
  replaceStructuredSkills: boolean;
}): boolean {
  if (!args.isReapply || !args.applyValues) return false;
  if (hasCvDerivedTextOverwriteConflict(args.form, args.patch)) return true;
  if (
    args.replaceStructuredSkills &&
    parseStructuredSkillsFromForm(args.form).length > 0
  ) {
    return true;
  }
  return false;
}

export function CandidateFormCvSection({
  skillsCatalog,
  existingCvFileName,
  autofillFormRef,
  onAutofillApplied,
  formResetKey = 0,
}: {
  skillsCatalog: SkillOption[];
  existingCvFileName?: string | null;
  autofillFormRef: RefObject<HTMLFormElement | null>;
  onAutofillApplied: (payload: CvAutofillApplyPayload) => void;
  /** Bumps when the parent dialog remounts the form — resets first/reapply counters. */
  formResetKey?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CvExtractionSummary | null>(null);
  const [successfulSuggestCount, setSuccessfulSuggestCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingPayloadRef = useRef<CvAutofillApplyPayload | null>(null);

  useEffect(() => {
    setSuccessfulSuggestCount(0);
    setSummary(null);
    setHint(null);
    setError(null);
    pendingPayloadRef.current = null;
    setConfirmOpen(false);
  }, [formResetKey]);

  function finishApply(payload: CvAutofillApplyPayload, hintText: string | null) {
    if (payload.applyValues) {
      setSuccessfulSuggestCount((c) => c + 1);
      console.log("[cv-autofill] Applying CV-derived fields", {
        patchKeys: Object.keys(payload.patch),
        replaceStructuredSkills: Boolean(payload.replaceStructuredSkills),
        skillsCount: payload.extraStructuredSkills.length,
      });
    }
    onAutofillApplied(payload);
    setHint(hintText);
  }

  function runCommitFromPending() {
    const payload = pendingPayloadRef.current;
    pendingPayloadRef.current = null;
    setConfirmOpen(false);
    if (!payload) return;
    const hintText =
      "Datos del CV reaplicados en los campos tomados del archivo (puedes editar antes de guardar).";
    finishApply(payload, hintText);
  }

  async function runExtract() {
    setError(null);
    setHint(null);
    const file = selectedFile ?? inputRef.current?.files?.[0] ?? null;
    if (!file) {
      setError("Selecciona un archivo CV primero.");
      return;
    }
    const form = autofillFormRef.current;

    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/candidates/cv-extract-preview", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        source?: string;
        suggestions?: CvAutofillSuggestions;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "No se pudo analizar el CV");
      }
      const suggestions = data.suggestions ?? {};
      const hasStringSuggestion = Object.values(suggestions).some(
        (v) => typeof v === "string" && v.trim() !== "",
      );

      const patch = suggestionsToCvDerivedPatch(suggestions);
      const provenance = patchProvenanceKeys(patch);

      const isReapply = successfulSuggestCount >= 1;
      const skillsLineTrimmed = suggestions.skillsLine?.trim() ?? "";
      const replaceStructuredSkills = isReapply && Boolean(skillsLineTrimmed);
      const newSkillsFromLine = matchSkillsFromLine(suggestions.skillsLine, skillsCatalog);

      let extraStructuredSkills: CandidateSkillDraft[];
      let skippedSkills = 0;
      if (replaceStructuredSkills) {
        extraStructuredSkills = newSkillsFromLine;
      } else {
        const existingSkills = parseStructuredSkillsFromForm(form);
        const existingIds = new Set(existingSkills.map((s) => s.skillId));
        extraStructuredSkills = newSkillsFromLine.filter((s) => !existingIds.has(s.skillId));
        skippedSkills = newSkillsFromLine.length - extraStructuredSkills.length;
      }

      const skillTokens = countSkillTokens(suggestions.skillsLine);
      const summaryPayload = buildExtractionSummary(
        suggestions,
        skillTokens,
        newSkillsFromLine.length,
      );
      const totallyEmpty =
        !hasStringSuggestion &&
        !skillsLineTrimmed &&
        extraStructuredSkills.length === 0 &&
        Object.keys(patch).length === 0;

      setSummary(totallyEmpty ? null : summaryPayload);

      const skillsPartApply =
        (!isReapply && extraStructuredSkills.length > 0) ||
        (replaceStructuredSkills && Boolean(skillsLineTrimmed));
      const applyValues =
        Object.keys(patch).length > 0 || skillsPartApply;

      const payload: CvAutofillApplyPayload = {
        patch,
        extraStructuredSkills,
        provenanceKeys: provenance,
        summary: totallyEmpty ? null : summaryPayload,
        structuredSkillsAddedCount: extraStructuredSkills.length,
        skippedFilledFieldCount: 0,
        applyValues,
        replaceStructuredSkills,
      };

      if (totallyEmpty) {
        setHint(
          data.source === "unsupported"
            ? "La extracción automática solo está disponible para PDF en esta versión. Puedes completar el formulario a mano."
            : "No se detectaron campos en el PDF. Completa el perfil manualmente.",
        );
        onAutofillApplied({
          ...payload,
          applyValues: false,
        });
        return;
      }

      if (!applyValues) {
        setHint("No hubo valores nuevos que aplicar (revisa el resumen arriba).");
        onAutofillApplied({
          ...payload,
          applyValues: false,
        });
        return;
      }

      const mustConfirm = needsReapplyConfirmation({
        isReapply,
        applyValues: true,
        form,
        patch,
        replaceStructuredSkills,
      });

      if (mustConfirm) {
        pendingPayloadRef.current = payload;
        setConfirmOpen(true);
        return;
      }

      const parts: string[] = [];
      if (isReapply) {
        parts.push(
          "Datos del CV reaplicados en los campos permitidos (puedes editar antes de guardar).",
        );
      } else {
        parts.push(
          "Sugerencias aplicadas desde el CV (puedes editarlas antes de guardar). Si vuelves a sugerir, esos mismos campos se sustituirán otra vez, con confirmación si ya hay datos escritos.",
        );
      }
      if (!isReapply && skippedSkills > 0) {
        parts.push(`${skippedSkills} competencia(s) del CV ya estaban en la lista.`);
      }
      finishApply(payload, parts.join(" "));
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : "Error al extraer texto del CV");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-4">
      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) pendingPayloadRef.current = null;
          setConfirmOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Volver a aplicar datos del CV</DialogTitle>
            <DialogDescription className="text-pretty">
              Los campos tomados del archivo (nombre, contacto, rol, textos de CV e idiomas, y las
              competencias inferidas de la línea de skills del CV) se sustituirán por la extracción
              más reciente. No se modifican etapa de reclutamiento, vacante vinculada,
              disponibilidad ni notas internas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                pendingPayloadRef.current = null;
                setConfirmOpen(false);
                setHint("Reaplicación cancelada; el formulario no se cambió.");
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => runCommitFromPending()}>
              Sustituir con datos del CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-start gap-2">
        <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">CV original (opcional)</p>
          <p className="text-xs text-muted-foreground">
            Sube el CV con el formulario. PDF, DOC o DOCX (máx. 10 MB). La primera sugerencia rellena
            desde el CV; las siguientes vuelven a importar esos campos (con confirmación si ya hay
            datos). Si el análisis falla, el formulario sigue funcionando.
          </p>
          {existingCvFileName ? (
            <p className="text-xs text-muted-foreground">
              CV en ficha: <span className="font-medium text-foreground">{existingCvFileName}</span>
              {" — "}
              al guardar con un archivo nuevo, se reemplaza.
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="cvFile"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="block w-full max-w-md text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        onChange={(e) => {
          setSelectedFile(e.target.files?.[0] ?? null);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          disabled={extracting}
          onClick={() => void runExtract()}
        >
          <SparklesIcon className="size-3.5" aria-hidden />
          {extracting ? "Analizando…" : "Sugerir datos del CV"}
        </Button>
      </div>

      {summary ? (
        <div
          className="rounded-lg border border-border/80 bg-background/60 px-3 py-2.5 text-xs"
          aria-live="polite"
        >
          <p className="font-medium text-foreground">Resumen de extracción</p>
          <ul className="mt-1.5 grid gap-1 text-muted-foreground sm:grid-cols-2">
            <li>
              <span className="text-foreground/80">Nombre detectado:</span>{" "}
              {summary.displayName ?? "—"}
            </li>
            <li>
              <span className="text-foreground/80">Correo detectado:</span>{" "}
              {summary.email ?? "—"}
            </li>
            <li>
              <span className="text-foreground/80">Teléfono detectado:</span>{" "}
              {summary.phone ?? "—"}
            </li>
            <li>
              <span className="text-foreground/80">Rol detectado:</span>{" "}
              {summary.role ?? "—"}
            </li>
            <li>
              <span className="text-foreground/80">Tokens de competencias (CV):</span>{" "}
              {summary.skillsTokensDetected}
            </li>
            <li>
              <span className="text-foreground/80">Coincidencias en catálogo:</span>{" "}
              {summary.skillsCatalogMatches}
            </li>
            <li>
              <span className="text-foreground/80">Líneas de idiomas:</span>{" "}
              {summary.languageLinesDetected}
            </li>
            <li>
              <span className="text-foreground/80">Líneas de certificaciones:</span>{" "}
              {summary.certificationLinesDetected}
            </li>
          </ul>
        </div>
      ) : null}

      {hint ? (
        <p className={cn("text-xs text-muted-foreground")} role="status">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
