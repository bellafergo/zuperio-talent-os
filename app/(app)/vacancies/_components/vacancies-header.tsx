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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Vacancies
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Open roles mapped to deals and accounts. Rows are loaded from PostgreSQL;
          filters apply to the current page in the browser.
        </p>
      </div>
      {canManage ? (
        <VacanciesNewVacancyDialog
          opportunities={opportunities}
          skills={skills}
        />
      ) : null}
    </div>
  );
}
