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
        backLabel="Volver a matching"
        eyebrow="Inteligencia de match"
        title="Candidato vs vacante"
        description="Cobertura de skills requeridos (%), listas de cumplidos y faltantes, y contexto de senioridad/disponibilidad (sin sumar al %)."
      />
      <ComparisonMatrixCard bundle={bundle} layout="focus" />
    </div>
  );
}
