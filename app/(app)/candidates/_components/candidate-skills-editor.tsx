"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/skills/queries";
import {
  ROLE_SKILL_TEMPLATE_NAMES,
  ROLE_SKILL_TEMPLATES,
} from "@/lib/skills/role-skill-templates";
import { suggestSkillsFromText } from "@/lib/skills/suggest-from-text";
import type { CandidateSkillDraft } from "@/lib/candidates/validation";
import { cn } from "@/lib/utils";

function groupSkills(skills: SkillOption[]) {
  const byCat = new Map<string, SkillOption[]>();
  for (const s of skills) {
    const key = s.category?.trim() || "Uncategorized";
    const list = byCat.get(key) ?? [];
    list.push(s);
    byCat.set(key, list);
  }
  return [...byCat.entries()].sort(([a], [b]) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });
}

const checkboxClass = cn(
  "size-4 rounded border border-input bg-background",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-0",
);

export function CandidateSkillsEditor({
  skills,
  value,
  onChange,
  error,
  cvSuggestionSourceText = "",
}: {
  skills: SkillOption[];
  value: CandidateSkillDraft[];
  onChange: (next: CandidateSkillDraft[]) => void;
  error?: string;
  /** Free text from CV fields — used only to propose matches; user adds explicitly */
  cvSuggestionSourceText?: string;
}) {
  const selectedById = React.useMemo(() => {
    const m = new Map<string, CandidateSkillDraft>();
    for (const s of value) m.set(s.skillId, s);
    return m;
  }, [value]);

  const [search, setSearch] = React.useState("");
  const [catalogOpen, setCatalogOpen] = React.useState(false);

  const suggestedFromCv = React.useMemo(
    () => suggestSkillsFromText(cvSuggestionSourceText, skills),
    [cvSuggestionSourceText, skills],
  );

  const suggestedNotSelected = React.useMemo(
    () => suggestedFromCv.filter((s) => !selectedById.has(s.id)),
    [suggestedFromCv, selectedById],
  );

  const searchTrim = search.trim().toLowerCase();
  const searchHits = React.useMemo(() => {
    if (!searchTrim) return [];
    return skills
      .filter((s) => s.name.toLowerCase().includes(searchTrim))
      .filter((s) => !selectedById.has(s.id))
      .slice(0, 24);
  }, [skills, searchTrim, selectedById]);

  const groupedTechnology = React.useMemo(
    () => groupSkills(skills.filter((s) => s.skillType !== "METHODOLOGY")),
    [skills],
  );
  const groupedMethodology = React.useMemo(
    () => groupSkills(skills.filter((s) => s.skillType === "METHODOLOGY")),
    [skills],
  );

  const toggleSkill = (skillId: string) => {
    const next = new Map(selectedById);
    if (next.has(skillId)) {
      next.delete(skillId);
    } else {
      next.set(skillId, { skillId, yearsExperience: null, level: null });
    }
    onChange([...next.values()]);
  };

  const addSkill = (skillId: string) => {
    if (selectedById.has(skillId)) return;
    const next = new Map(selectedById);
    next.set(skillId, { skillId, yearsExperience: null, level: null });
    onChange([...next.values()]);
  };

  const patchSkill = (skillId: string, patch: Partial<CandidateSkillDraft>) => {
    const existing = selectedById.get(skillId);
    if (!existing) return;
    const next = new Map(selectedById);
    next.set(skillId, { ...existing, ...patch });
    onChange([...next.values()]);
  };

  const applyTemplate = (templateName: string) => {
    const templateIds = ROLE_SKILL_TEMPLATES[templateName];
    if (!templateIds) return;
    const catalogIds = new Set(skills.map((s) => s.id));
    const validIds = templateIds.filter((id) => catalogIds.has(id));
    const next = new Map(selectedById);
    for (const skillId of validIds) {
      if (!next.has(skillId)) {
        next.set(skillId, { skillId, yearsExperience: null, level: null });
      }
    }
    onChange([...next.values()]);
  };

  const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Competencias estructuradas</p>
          <p className="text-xs text-muted-foreground">
            Sugerencias desde CV son orientativas: añádelas solo si aplican. El match usa lo que
            guardes aquí.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{value.length} seleccionadas</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className={cn(
            "h-8 min-w-[160px] max-w-full flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "dark:bg-input/30",
          )}
          defaultValue=""
          aria-label="Plantilla de perfil"
          onChange={(e) => {
            if (e.target.value) {
              applyTemplate(e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Plantilla de perfil…
          </option>
          {ROLE_SKILL_TEMPLATE_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {value.length > 0 ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 shrink-0"
            onClick={() => onChange([])}
          >
            Limpiar
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {suggestedNotSelected.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm ring-1 ring-foreground/5">
          <p className="text-xs font-semibold text-foreground">Sugeridas desde CV / texto</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Revisa antes de añadir; no sustituyen tu criterio.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestedNotSelected.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => addSkill(s.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/70"
                >
                  <PlusIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm ring-1 ring-foreground/5">
        <p className="text-xs font-semibold text-foreground">Seleccionadas</p>
        {value.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Ninguna aún. Usa sugerencias o búsqueda.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {value.map((sel) => (
              <li
                key={sel.skillId}
                className="rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{skillName(sel.skillId)}</span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 shrink-0"
                    onClick={() => toggleSkill(sel.skillId)}
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Años</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50}
                      step={1}
                      value={sel.yearsExperience ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw.trim()) {
                          patchSkill(sel.skillId, { yearsExperience: null });
                          return;
                        }
                        const n = Number(raw);
                        if (!Number.isFinite(n)) return;
                        patchSkill(sel.skillId, { yearsExperience: Math.floor(n) });
                      }}
                      className="h-7"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Nivel</span>
                    <Input
                      value={sel.level ?? ""}
                      onChange={(e) =>
                        patchSkill(sel.skillId, {
                          level: e.target.value.trim() ? e.target.value : null,
                        })
                      }
                      placeholder="ej. Senior"
                      className="h-7"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Buscar y añadir</p>
        <Input
          type="search"
          placeholder="Escribe para filtrar el catálogo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
        {searchTrim && searchHits.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin coincidencias.</p>
        ) : null}
        {searchHits.length > 0 ? (
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/10 p-2">
            {searchHits.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">{s.name}</span>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    addSkill(s.id);
                    setSearch("");
                  }}
                >
                  Añadir
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl border border-dashed border-border">
        <button
          type="button"
          onClick={() => setCatalogOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/40"
        >
          {catalogOpen ? (
            <ChevronDownIcon className="size-4 shrink-0 opacity-70" aria-hidden />
          ) : (
            <ChevronRightIcon className="size-4 shrink-0 opacity-70" aria-hidden />
          )}
          Catálogo completo (tecnologías y metodologías)
        </button>
        {catalogOpen ? (
          <div className="max-h-[min(50vh,420px)] space-y-6 overflow-y-auto border-t border-border p-3">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">Tecnologías</p>
              {groupedTechnology.map(([category, list]) => (
                <div key={`t-${category}`} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {list.map((skill) => {
                      const selected = selectedById.get(skill.id);
                      return (
                        <div
                          key={skill.id}
                          className={cn(
                            "rounded-lg border px-3 py-2",
                            selected
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-muted/20",
                          )}
                        >
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              className={checkboxClass}
                              checked={Boolean(selected)}
                              onChange={() => toggleSkill(skill.id)}
                            />
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          </label>

                          {selected ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Años</span>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  max={50}
                                  step={1}
                                  value={selected.yearsExperience ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (!raw.trim()) {
                                      patchSkill(skill.id, { yearsExperience: null });
                                      return;
                                    }
                                    const n = Number(raw);
                                    if (!Number.isFinite(n)) return;
                                    patchSkill(skill.id, {
                                      yearsExperience: Math.floor(n),
                                    });
                                  }}
                                  className="h-7"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Nivel</span>
                                <Input
                                  value={selected.level ?? ""}
                                  onChange={(e) =>
                                    patchSkill(skill.id, {
                                      level: e.target.value.trim() ? e.target.value : null,
                                    })
                                  }
                                  placeholder="ej. Senior"
                                  className="h-7"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">Metodologías</p>
              {groupedMethodology.map(([category, list]) => (
                <div key={`m-${category}`} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {list.map((skill) => {
                      const selected = selectedById.get(skill.id);
                      return (
                        <div
                          key={skill.id}
                          className={cn(
                            "rounded-lg border px-3 py-2",
                            selected
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-muted/20",
                          )}
                        >
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              className={checkboxClass}
                              checked={Boolean(selected)}
                              onChange={() => toggleSkill(skill.id)}
                            />
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          </label>

                          {selected ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Años</span>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  max={50}
                                  step={1}
                                  value={selected.yearsExperience ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (!raw.trim()) {
                                      patchSkill(skill.id, { yearsExperience: null });
                                      return;
                                    }
                                    const n = Number(raw);
                                    if (!Number.isFinite(n)) return;
                                    patchSkill(skill.id, {
                                      yearsExperience: Math.floor(n),
                                    });
                                  }}
                                  className="h-7"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Nivel</span>
                                <Input
                                  value={selected.level ?? ""}
                                  onChange={(e) =>
                                    patchSkill(skill.id, {
                                      level: e.target.value.trim() ? e.target.value : null,
                                    })
                                  }
                                  placeholder="ej. Senior"
                                  className="h-7"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
