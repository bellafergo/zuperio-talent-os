"use client";

import { FileTextIcon, SparklesIcon } from "lucide-react";
import type { RefObject } from "react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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

const MERGE_FIELD_NAMES: CvAutofillProvenanceField[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "role",
  "notes",
  "locationCity",
  "workModality",
  "cvLanguagesText",
  "cvCertificationsText",
  "cvEducationText",
  "cvSoftSkillsText",
  "cvIndustriesText",
];

function isEmptyFieldValue(v: string): boolean {
  return v.trim() === "";
}

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

function suggestionsToFullPatch(s: CvAutofillSuggestions): Partial<CandidateEditData> {
  const patch: Partial<CandidateEditData> = {};
  if (s.firstName?.trim()) patch.firstName = s.firstName.trim().slice(0, 120);
  if (s.lastName?.trim()) patch.lastName = s.lastName.trim().slice(0, 120);
  if (s.email?.trim()) patch.email = s.email.trim().toLowerCase();
  if (s.phone?.trim()) patch.phone = s.phone.trim().slice(0, 80);
  if (s.role?.trim()) patch.role = s.role.trim().slice(0, 200);
  if (s.notes?.trim()) patch.notes = s.notes.trim();
  if (s.locationCity?.trim()) patch.locationCity = s.locationCity.trim().slice(0, 200);
  if (s.workModality?.trim()) patch.workModality = s.workModality.trim().slice(0, 120);
  if (s.cvLanguagesText?.trim()) patch.cvLanguagesText = s.cvLanguagesText.trim();
  if (s.cvCertificationsText?.trim()) patch.cvCertificationsText = s.cvCertificationsText.trim();
  if (s.cvEducationText?.trim()) patch.cvEducationText = s.cvEducationText.trim();
  return patch;
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

function mergePatchOnlyEmptyFields(
  fullPatch: Partial<CandidateEditData>,
  form: HTMLFormElement | null,
): { patch: Partial<CandidateEditData>; provenance: CvAutofillProvenanceField[]; skippedFilled: number } {
  const patch: Partial<CandidateEditData> = {};
  const provenance: CvAutofillProvenanceField[] = [];
  let skippedFilled = 0;

  for (const key of MERGE_FIELD_NAMES) {
    if (!(key in fullPatch)) continue;
    const suggested = fullPatch[key];
    if (suggested === undefined || suggested === null) continue;
    if (typeof suggested !== "string") continue;
    if (!suggested.trim()) continue;

    if (form) {
      const current = readFormControlValue(form, key);
      if (!isEmptyFieldValue(current)) {
        skippedFilled += 1;
        continue;
      }
    }
    // When form is null we cannot read live DOM values, so we apply all non-empty suggestions
    (patch as Record<string, string>)[key] = suggested;
    provenance.push(key);
  }

  return { patch, provenance, skippedFilled };
}

export function CandidateFormCvSection({
  skillsCatalog,
  existingCvFileName,
  autofillFormRef,
  onAutofillApplied,
}: {
  skillsCatalog: SkillOption[];
  existingCvFileName?: string | null;
  autofillFormRef: RefObject<HTMLFormElement | null>;
  onAutofillApplied: (payload: CvAutofillApplyPayload) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CvExtractionSummary | null>(null);

  async function runExtract() {
    setError(null);
    setHint(null);
    // State-backed file is the source of truth; ref is a secondary fallback
    const file = selectedFile ?? inputRef.current?.files?.[0] ?? null;
    if (!file) {
      setError("Selecciona un archivo CV primero.");
      return;
    }
    const form = autofillFormRef.current;
    // form may be null in rare timing windows; mergePatchOnlyEmptyFields handles null gracefully

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
      const fullPatch = suggestionsToFullPatch(suggestions);
      const { patch, provenance, skippedFilled } = mergePatchOnlyEmptyFields(fullPatch, form);

      const extraFromLine = matchSkillsFromLine(suggestions.skillsLine, skillsCatalog);
      const existingSkills = parseStructuredSkillsFromForm(form);
      const existingIds = new Set(existingSkills.map((s) => s.skillId));
      const extraStructuredSkills = extraFromLine.filter((s) => !existingIds.has(s.skillId));
      const skippedSkills = extraFromLine.length - extraStructuredSkills.length;

      const skillTokens = countSkillTokens(suggestions.skillsLine);
      const summaryPayload = buildExtractionSummary(
        suggestions,
        skillTokens,
        extraStructuredSkills.length,
      );
      const totallyEmpty = !hasStringSuggestion && extraFromLine.length === 0;
      setSummary(totallyEmpty ? null : summaryPayload);

      const applyValues =
        Object.keys(patch).length > 0 || extraStructuredSkills.length > 0;

      if (applyValues) {
        console.log("[cv-autofill] Applying autofill to form fields", {
          patchKeys: Object.keys(patch),
          skillsAdded: extraStructuredSkills.length,
          skippedFilled,
        });
      }
      onAutofillApplied({
        patch,
        extraStructuredSkills,
        provenanceKeys: provenance,
        summary: summaryPayload,
        structuredSkillsAddedCount: extraStructuredSkills.length,
        skippedFilledFieldCount: skippedFilled,
        applyValues,
      });

      if (totallyEmpty) {
        setHint(
          data.source === "unsupported"
            ? "La extracción automática solo está disponible para PDF en esta versión. Puedes completar el formulario a mano."
            : "No se detectaron campos en el PDF. Completa el perfil manualmente.",
        );
      } else if (!applyValues && (skippedFilled > 0 || skippedSkills > 0)) {
        setHint(
          "Los campos ya tenían datos: no se sobrescribió nada. Vacía un campo y vuelve a sugerir si quieres rellenarlo desde el CV.",
        );
      } else if (!applyValues) {
        setHint("No hubo valores nuevos que aplicar (revisa el resumen arriba).");
      } else {
        const parts: string[] = [
          "Sugerencias aplicadas solo en campos vacíos (puedes editarlas antes de guardar).",
        ];
        if (skippedFilled > 0) {
          parts.push(`${skippedFilled} campo(s) ya tenían texto y se dejaron igual.`);
        }
        if (skippedSkills > 0) {
          parts.push(`${skippedSkills} competencia(s) del CV ya estaban en la lista.`);
        }
        setHint(parts.join(" "));
      }
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : "Error al extraer texto del CV");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-4">
      <div className="flex items-start gap-2">
        <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">CV original (opcional)</p>
          <p className="text-xs text-muted-foreground">
            Sube el CV con el formulario. PDF, DOC o DOCX (máx. 10 MB). Las sugerencias solo rellenan
            campos vacíos; si el análisis falla, el formulario sigue funcionando.
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
