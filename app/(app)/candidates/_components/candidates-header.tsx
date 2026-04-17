import { PageHeader } from "@/components/layout";
import type { SkillOption } from "@/lib/skills/queries";
import type { OpenVacancyOptionForCandidateForm } from "@/lib/vacancies/queries";

import { CandidatesNewCandidateDialog } from "./candidates-new-candidate-dialog";

export function CandidatesHeader({
  canManage,
  skillsCatalog,
  openVacancies = [],
}: {
  canManage: boolean;
  skillsCatalog: SkillOption[];
  openVacancies?: OpenVacancyOptionForCandidateForm[];
}) {
  return (
    <PageHeader
      variant="list"
      title="Candidatos"
      description="Pool para staff augmentation. Perfiles en base de datos; el matching estructurado puntúa vacantes de forma determinista."
      actions={
        canManage ? (
          <CandidatesNewCandidateDialog
            skillsCatalog={skillsCatalog}
            openVacancies={openVacancies}
          />
        ) : null
      }
    />
  );
}
