"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/skills/queries";
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

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Structured requirements</p>
          <p className="text-xs text-muted-foreground">
            Select skills from the catalog. Mark required vs nice-to-have and
            optionally set minimum experience.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {value.length} selected
        </p>
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
                            Required
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Min years
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

