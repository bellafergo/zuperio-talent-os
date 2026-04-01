import { EmptyState, SectionCard } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import type { CandidateStructuredSkillUi } from "@/lib/skills/types";

function groupByCategory(items: CandidateStructuredSkillUi[]) {
  const map = new Map<string, CandidateStructuredSkillUi[]>();
  for (const s of items) {
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
  const groups = groupByCategory(skills);
  const hasLegacy =
    legacySkillsLine.trim() !== "" && legacySkillsLine.trim() !== "—";

  return (
    <SectionCard
      title="Skills"
      description="Structured catalog links with optional years and level. Legacy free-text is kept below for transition."
      contentClassName="space-y-6 pt-4"
    >
        {groups.length === 0 ? (
          <EmptyState
            variant="embedded"
            title="No structured skills yet"
            description="Add catalog skills on the candidate record to power matching."
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
              Legacy profile text
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {legacySkillsLine}
            </p>
          </div>
        ) : null}
    </SectionCard>
  );
}
