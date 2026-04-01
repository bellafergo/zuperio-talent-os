import { PageHeader } from "@/components/layout";
import type { SkillOption } from "@/lib/skills/queries";
import type { OpportunityOptionForVacancyForm } from "@/lib/vacancies/queries";

import { VacanciesNewVacancyDialog } from "./vacancies-new-vacancy-dialog";

export function VacanciesHeader({
  canManage,
  opportunities,
  skills,
}: {
  canManage: boolean;
  opportunities: OpportunityOptionForVacancyForm[];
  skills: SkillOption[];
}) {
  return (
    <PageHeader
      variant="list"
      title="Vacantes"
      description="Roles abiertos ligados a oportunidades y cuentas. Los filtros aplican a la página cargada."
      actions={
        canManage ? (
          <VacanciesNewVacancyDialog opportunities={opportunities} skills={skills} />
        ) : null
      }
    />
  );
}
