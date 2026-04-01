import { listVacanciesForUi } from "@/lib/vacancies/queries";

import { VacanciesHeader } from "./_components/vacancies-header";
import { VacanciesModule } from "./_components/vacancies-module";

export const dynamic = "force-dynamic";

export default async function VacanciesPage() {
  const vacancies = await listVacanciesForUi();

  return (
    <div className="space-y-6">
      <VacanciesHeader />
      <VacanciesModule vacancies={vacancies} />
    </div>
  );
}
