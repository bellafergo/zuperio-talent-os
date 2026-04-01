import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { listSkillsForVacancyForm } from "@/lib/skills/queries";
import { listCandidatesForUi } from "@/lib/candidates/queries";

import { CandidatesHeader } from "./_components/candidates-header";
import { CandidatesModule } from "./_components/candidates-module";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const [candidates, skillsCatalog] = await Promise.all([
    listCandidatesForUi(),
    canManage ? listSkillsForVacancyForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <CandidatesHeader canManage={canManage} skillsCatalog={skillsCatalog} />
      <CandidatesModule candidates={candidates} />
    </div>
  );
}
