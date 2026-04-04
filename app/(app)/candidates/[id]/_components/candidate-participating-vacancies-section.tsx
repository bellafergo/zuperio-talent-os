import Link from "next/link";

import { SectionCard } from "@/components/layout";
import type { CandidateParticipatingVacancyUi } from "@/lib/candidates/participating-vacancies-queries";

export function CandidateParticipatingVacanciesSection({
  rows,
}: {
  rows: CandidateParticipatingVacancyUi[];
}) {
  return (
    <SectionCard
      title="Vacantes en las que participa"
      description="Vacante vinculada en pipeline y postulaciones registradas (sin duplicar por vacante)."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este candidato no tiene vacante de pipeline ni postulaciones activas o históricas registradas.
        </p>
      ) : (
        <ul className="divide-y divide-border/80 rounded-lg border border-border/60">
          {rows.map((r) => (
            <li key={r.vacancyId} className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  <Link
                    href={`/vacancies/${r.vacancyId}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {r.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">{r.companyName}</p>
              </div>
              <p className="max-w-xl text-xs text-muted-foreground sm:text-right">{r.detailLine}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
