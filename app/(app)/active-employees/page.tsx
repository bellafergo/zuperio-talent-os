import { auth } from "@/auth";
import { canManagePlacements } from "@/lib/auth/placement-access";
import {
  listCandidatesForPlacementForm,
  listPlacementsForActiveEmployeesUi,
  listVacanciesForPlacementForm,
} from "@/lib/placements/queries";

import { ActiveEmployeesDataTable } from "./_components/active-employees-data-table";
import { ActiveEmployeesHeader } from "./_components/active-employees-header";

export const dynamic = "force-dynamic";

export default async function ActiveEmployeesPage() {
  const session = await auth();
  const canManage = canManagePlacements(session?.user?.role);

  const [rows, candidates, vacancies] = await Promise.all([
    listPlacementsForActiveEmployeesUi(),
    canManage ? listCandidatesForPlacementForm() : Promise.resolve([]),
    canManage ? listVacanciesForPlacementForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <ActiveEmployeesHeader
        canManage={canManage}
        candidates={candidates}
        vacancies={vacancies}
      />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <ActiveEmployeesDataTable
          rows={rows}
          canManage={canManage}
          candidates={candidates}
          vacancies={vacancies}
        />
      </div>
    </div>
  );
}
