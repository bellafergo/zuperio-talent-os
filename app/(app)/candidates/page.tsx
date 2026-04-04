import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { listSkillsForVacancyForm } from "@/lib/skills/queries";
import type { SkillOption } from "@/lib/skills/queries";
import { listCandidatesForUi } from "@/lib/candidates/queries";

import { CandidatesHeader } from "./_components/candidates-header";
import { CandidatesModule } from "./_components/candidates-module";

export const dynamic = "force-dynamic";

async function safeCandidatesListSecondaryFetch<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error(`[candidates/list] ${label} failed`, err);
    return fallback;
  }
}

export default async function CandidatesPage() {
  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const [candidates, skillsCatalog] = await Promise.all([
    listCandidatesForUi(),
    canManage
      ? safeCandidatesListSecondaryFetch(
          "listSkillsForVacancyForm",
          listSkillsForVacancyForm(),
          [] as SkillOption[],
        )
      : Promise.resolve([] as SkillOption[]),
  ]);

  return (
    <div className="space-y-8">
      <CandidatesHeader canManage={canManage} skillsCatalog={skillsCatalog} />
      <CandidatesModule candidates={candidates} />
    </div>
  );
}
