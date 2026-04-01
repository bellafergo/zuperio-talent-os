import { notFound } from "next/navigation";

import { ComparisonMatrixCard } from "@/components/comparison-matrix-card";
import { PageHeader } from "@/components/layout";
import { getComparisonMatrixByMatchId } from "@/lib/matching/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export default async function MatchingComparePage({ params }: PageProps) {
  const { matchId } = await params;
  const bundle = await getComparisonMatrixByMatchId(matchId);
  if (!bundle) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/matching"
        backLabel="Back to matching"
        title="Candidate vs vacancy matrix"
        description="Structured comparison for this scored pair — same engine as the match list."
      />
      <ComparisonMatrixCard bundle={bundle} />
    </div>
  );
}
