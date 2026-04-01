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
      title="Candidatos"
      description="Pool para staff augmentation. Perfiles en base de datos; el matching estructurado puntúa vacantes de forma determinista."
      actions={
        canManage ? (
          <CandidatesNewCandidateDialog skillsCatalog={skillsCatalog} />
        ) : null
      }
    />
  );
}
