import { PageHeader } from "@/components/layout";
import type { SkillOption } from "@/lib/skills/queries";
import type { OpportunityOptionForVacancyForm } from "@/lib/vacancies/queries";
import type { CompanyOption } from "@/lib/vacancies/types";

import { VacanciesNewVacancyDialog } from "./vacancies-new-vacancy-dialog";

export function VacanciesHeader({
  canManage,
  companies,
  opportunities,
  skills,
}: {
  canManage: boolean;
  companies: CompanyOption[];
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
          <VacanciesNewVacancyDialog
            companies={companies}
            opportunities={opportunities}
            skills={skills}
          />
        ) : null
      }
    />
  );
}
