import { Badge } from "@/components/ui/badge";
import type { SkillCatalogGroupUi } from "@/lib/skills/types";

export function SkillsCatalog({ groups }: { groups: SkillCatalogGroupUi[] }) {
  if (groups.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No skills in the catalog yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.categoryLabel}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {g.categoryLabel}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {g.skills.map((s) => (
              <Badge key={s.id} variant="outline" className="font-normal">
                {s.name}
              </Badge>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
