import { auth } from "@/auth";
import { DataTableShell, PageHeader } from "@/components/layout";
import { canManageSkills } from "@/lib/auth/skill-access";
import { listSkillsCatalogGroupedForUi } from "@/lib/skills/queries";

import { SkillAddDialog } from "./_components/skill-add-dialog";
import { SkillsCatalog } from "./_components/skills-catalog";

export const dynamic = "force-dynamic";

export default async function SkillsCatalogPage() {
  const session = await auth();
  const canManage = canManageSkills(session?.user?.role);

  const groups = await listSkillsCatalogGroupedForUi();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="list"
        title="Catálogo de skills"
        description="Nombres normalizados de skills usados en perfiles de candidatos y requisitos de vacantes."
        actions={canManage ? <SkillAddDialog /> : null}
      />
      <DataTableShell paddingClassName="p-4 sm:p-6">
        <SkillsCatalog groups={groups} />
      </DataTableShell>
    </div>
  );
}
