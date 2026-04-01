import type {
  PlacementCandidateOption,
  PlacementVacancyOption,
} from "@/lib/placements/queries";

import { PlacementsNewPlacementDialog } from "./placements-new-placement-dialog";

export function ActiveEmployeesHeader({
  canManage,
  candidates,
  vacancies,
}: {
  canManage: boolean;
  candidates: PlacementCandidateOption[];
  vacancies: PlacementVacancyOption[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Active employees
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Placements link candidates to client accounts through vacancies. Active
          and completed assignments are loaded from PostgreSQL.
        </p>
      </div>
      {canManage ? (
        <PlacementsNewPlacementDialog candidates={candidates} vacancies={vacancies} />
      ) : null}
    </div>
  );
}
