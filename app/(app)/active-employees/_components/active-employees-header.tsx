import { PageHeader } from "@/components/layout";
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
    <PageHeader
      variant="list"
      title="Active employees"
      description="Placements link candidates to client accounts through vacancies. Active and completed assignments are loaded from PostgreSQL."
      actions={
        canManage ? (
          <PlacementsNewPlacementDialog candidates={candidates} vacancies={vacancies} />
        ) : null
      }
    />
  );
}
