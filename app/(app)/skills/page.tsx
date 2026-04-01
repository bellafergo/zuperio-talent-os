import { DataTableShell, PageHeader } from "@/components/layout";
import { listSkillsCatalogGroupedForUi } from "@/lib/skills/queries";

import { SkillsCatalog } from "./_components/skills-catalog";

export const dynamic = "force-dynamic";

export default async function SkillsCatalogPage() {
  const groups = await listSkillsCatalogGroupedForUi();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="list"
        title="Skills catalog"
        description="Normalized skill names used on candidate profiles and vacancy requirements. Read-only reference for recruiters and sourcing."
      />
      <DataTableShell paddingClassName="p-4 sm:p-6">
        <SkillsCatalog groups={groups} />
      </DataTableShell>
    </div>
  );
}
