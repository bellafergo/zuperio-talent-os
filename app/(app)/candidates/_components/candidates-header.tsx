import type { SkillOption } from "@/lib/skills/queries";

import { CandidatesNewCandidateDialog } from "./candidates-new-candidate-dialog";

export function CandidatesHeader({
  canManage,
  skillsCatalog,
}: {
  canManage: boolean;
  skillsCatalog: SkillOption[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Candidates
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Consultant and contractor pool for staff augmentation. Profiles are
          stored in PostgreSQL; matching to vacancies will layer on later.
        </p>
      </div>
      {canManage ? (
        <CandidatesNewCandidateDialog skillsCatalog={skillsCatalog} />
      ) : null}
    </div>
  );
}
