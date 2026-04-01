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
      title="Vacancies"
      description="Open roles mapped to deals and accounts. Rows are loaded from PostgreSQL; filters apply to the current page in the browser."
      actions={
        canManage ? (
          <VacanciesNewVacancyDialog opportunities={opportunities} skills={skills} />
        ) : null
      }
    />
  );
}
