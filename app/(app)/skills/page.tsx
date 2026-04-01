import { listSkillsCatalogGroupedForUi } from "@/lib/skills/queries";

import { SkillsCatalog } from "./_components/skills-catalog";

export const dynamic = "force-dynamic";

export default async function SkillsCatalogPage() {
  const groups = await listSkillsCatalogGroupedForUi();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Skills catalog
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Normalized skill names used on candidate profiles and vacancy
          requirements. Read-only reference for recruiters and sourcing.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-6">
        <SkillsCatalog groups={groups} />
      </div>
    </div>
  );
}
