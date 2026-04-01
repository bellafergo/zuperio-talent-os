import { listCandidatesForUi } from "@/lib/candidates/queries";

import { CandidatesHeader } from "./_components/candidates-header";
import { CandidatesModule } from "./_components/candidates-module";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await listCandidatesForUi();

  return (
    <div className="space-y-6">
      <CandidatesHeader />
      <CandidatesModule candidates={candidates} />
    </div>
  );
}
