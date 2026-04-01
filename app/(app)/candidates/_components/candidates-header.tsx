import { PageHeader } from "@/components/layout";
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
    <PageHeader
      variant="list"
      title="Candidates"
      description="Consultant and contractor pool for staff augmentation. Profiles are stored in PostgreSQL; structured matching scores vacancies deterministically."
      actions={
        canManage ? (
          <CandidatesNewCandidateDialog skillsCatalog={skillsCatalog} />
        ) : null
      }
    />
  );
}
