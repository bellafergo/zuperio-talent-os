import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Skills</CardTitle>
        <CardDescription>
          Structured catalog links with optional years and level. Legacy
          free-text is kept below for transition.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No structured skills on file yet.
          </p>
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
      </CardContent>
    </Card>
  );
}
