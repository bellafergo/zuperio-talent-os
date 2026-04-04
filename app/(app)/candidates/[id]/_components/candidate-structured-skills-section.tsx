import { EmptyState, SectionCard } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import type { CandidateStructuredSkillUi } from "@/lib/skills/types";

function groupByCategory(items: CandidateStructuredSkillUi[]) {
  const map = new Map<string, CandidateStructuredSkillUi[]>();
  for (const s of items) {
    if (
      !s ||
      typeof s !== "object" ||
      typeof s.id !== "string" ||
      typeof s.name !== "string"
    ) {
      continue;
    }
    const label = s.category?.trim() || "General";
    const list = map.get(label) ?? [];
    list.push(s);
    map.set(label, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CandidateStructuredSkillsSection({
  skills,
  legacySkillsLine,
}: {
  skills: CandidateStructuredSkillUi[];
  legacySkillsLine: string;
}) {
  const list = Array.isArray(skills) ? skills : [];
  const legacy =
    typeof legacySkillsLine === "string" ? legacySkillsLine : "";
  const groups = groupByCategory(list);
  const hasLegacy = legacy.trim() !== "" && legacy.trim() !== "—";

  return (
    <SectionCard
      title="Competencias"
      description="Skills del catálogo con años y nivel opcionales. El texto libre anterior se conserva abajo para transición."
      contentClassName="space-y-6 pt-4"
    >
        {groups.length === 0 ? (
          <EmptyState
            variant="embedded"
            title="Sin skills estructurados aún"
            description="Agrega skills del catálogo en el registro del candidato para activar el matching."
          />
        ) : (
          groups.map(([category, items]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="max-w-full font-normal"
                  >
                    <span className="truncate">{s.name}</span>
                    {s.yearsExperience != null ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {s.yearsLabel}
                      </span>
                    ) : null}
                    {s.level ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {s.level}
                      </span>
                    ) : null}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
        {hasLegacy ? (
          <div className="border-t border-border pt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Perfil libre (texto anterior)
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {legacySkillsLine}
            </p>
          </div>
        ) : null}
    </SectionCard>
  );
}
