"use client";

import { FileTextIcon, SparklesIcon } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CvAutofillSuggestions } from "@/lib/candidates/cv-autofill-types";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { CandidateSkillDraft } from "@/lib/candidates/validation";
import type { SkillOption } from "@/lib/skills/queries";

function suggestionsToEditPatch(s: CvAutofillSuggestions): Partial<CandidateEditData> {
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

export function CandidateFormCvSection({
  skillsCatalog,
  existingCvFileName,
  onAutofillApplied,
}: {
  skillsCatalog: SkillOption[];
  existingCvFileName?: string | null;
  onAutofillApplied: (
    patch: Partial<CandidateEditData>,
    extraStructuredSkills: CandidateSkillDraft[],
  ) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runExtract() {
    setError(null);
    setHint(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo CV primero.");
      return;
    }
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
      const patch = suggestionsToEditPatch(suggestions);
      const extraSkills = matchSkillsFromLine(suggestions.skillsLine, skillsCatalog);
      onAutofillApplied(patch, extraSkills);
      if (!hasStringSuggestion && extraSkills.length === 0) {
        setHint(
          data.source === "unsupported"
            ? "La extracción automática solo está disponible para PDF en esta versión. Puedes completar el formulario a mano."
            : "No se detectaron campos en el PDF. Completa el perfil manualmente.",
        );
      } else {
        setHint(
          "Sugerencias aplicadas a los campos (puedes editarlas antes de guardar).",
        );
      }
    } catch (e) {
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
            Sube el CV con el formulario. PDF, DOC o DOCX (máx. 10 MB). Puedes extraer sugerencias
            de datos antes de guardar; si falla el análisis, el formulario sigue funcionando.
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

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
