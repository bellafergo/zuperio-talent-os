"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/skills/queries";
import {
  ROLE_SKILL_TEMPLATE_NAMES,
  ROLE_SKILL_TEMPLATES,
} from "@/lib/skills/role-skill-templates";
import type { VacancyRequirementDraft } from "@/lib/vacancies/types";
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

export function VacancyRequirementsEditor({
  skills,
  value,
  onChange,
  error,
}: {
  skills: SkillOption[];
  value: VacancyRequirementDraft[];
  onChange: (next: VacancyRequirementDraft[]) => void;
  error?: string;
}) {
  const selectedById = React.useMemo(() => {
    const m = new Map<string, VacancyRequirementDraft>();
    for (const r of value) m.set(r.skillId, r);
    return m;
  }, [value]);

  const grouped = React.useMemo(() => groupSkills(skills), [skills]);

  const toggleSkill = (skillId: string) => {
    const next = new Map(selectedById);
    if (next.has(skillId)) {
      next.delete(skillId);
    } else {
      next.set(skillId, { skillId, required: true, minimumYears: null });
    }
    onChange([...next.values()]);
  };

  const setReq = (skillId: string, patch: Partial<VacancyRequirementDraft>) => {
    const existing = selectedById.get(skillId);
    if (!existing) return;
    const next = new Map(selectedById);
    next.set(skillId, { ...existing, ...patch });
    onChange([...next.values()]);
  };

  const applyRoleTemplate = (templateName: string) => {
    const ids = ROLE_SKILL_TEMPLATES[templateName];
    if (!ids?.length) return;
    const catalogIds = new Set(skills.map((s) => s.id));
    const next = new Map(selectedById);
    for (const skillId of ids) {
      if (!catalogIds.has(skillId)) continue;
      if (!next.has(skillId)) {
        next.set(skillId, { skillId, required: true, minimumYears: null });
      }
    }
    onChange([...next.values()]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Skills requeridos y deseables</p>
          <p className="text-xs text-muted-foreground">
            Mismo catálogo que candidatos. El match se calcula solo con skills
            marcados como requeridos (cobertura %, determinista).
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{value.length} en lista</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className={cn(
            "h-8 min-w-[200px] flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "dark:bg-input/30",
          )}
          defaultValue=""
          aria-label="Plantilla de rol para skills"
          onChange={(e) => {
            if (e.target.value) {
              applyRoleTemplate(e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Autocompletar desde rol (plantilla)…
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
            className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2"
            onClick={() => onChange([])}
          >
            Quitar todos
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm ring-1 ring-foreground/5">
        <div className="space-y-4">
          {grouped.map(([category, list]) => (
            <div key={category} className="space-y-2">
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
                        <span className="text-sm font-medium text-foreground">
                          {skill.name}
                        </span>
                      </label>

                      {selected ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              className={checkboxClass}
                              checked={selected.required}
                              onChange={(e) =>
                                setReq(skill.id, { required: e.target.checked })
                              }
                            />
                            Requerido
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Años mín.
                            </span>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={50}
                              step={1}
                              value={selected.minimumYears ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (!raw.trim()) {
                                  setReq(skill.id, { minimumYears: null });
                                  return;
                                }
                                const n = Number(raw);
                                if (!Number.isFinite(n)) return;
                                setReq(skill.id, {
                                  minimumYears: Math.floor(n),
                                });
                              }}
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
    </div>
  );
}

