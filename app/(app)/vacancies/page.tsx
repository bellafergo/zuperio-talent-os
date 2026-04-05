import { auth } from "@/auth";
import { canManageVacancies } from "@/lib/auth/vacancy-access";
import { listSkillsForVacancyForm } from "@/lib/skills/queries";
import {
  listCompaniesForVacancyForm,
  listContactsForVacancyForm,
  listOpportunitiesForVacancyForm,
  listVacanciesForUi,
} from "@/lib/vacancies/queries";

import { VacanciesHeader } from "./_components/vacancies-header";
import { VacanciesModule } from "./_components/vacancies-module";

export const dynamic = "force-dynamic";

export default async function VacanciesPage() {
  const session = await auth();
  const canManage = canManageVacancies(session?.user?.role);
  const [vacancies, companies, opportunities, contacts, skills] = await Promise.all([
    listVacanciesForUi(),
    canManage ? listCompaniesForVacancyForm() : Promise.resolve([]),
    canManage ? listOpportunitiesForVacancyForm() : Promise.resolve([]),
    canManage ? listContactsForVacancyForm() : Promise.resolve([]),
    canManage ? listSkillsForVacancyForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <VacanciesHeader
        canManage={canManage}
        companies={companies}
        opportunities={opportunities}
        contacts={contacts}
        skills={skills}
      />
      <VacanciesModule vacancies={vacancies} />
    </div>
  );
}
