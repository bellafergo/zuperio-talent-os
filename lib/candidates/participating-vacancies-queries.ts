import { prisma } from "@/lib/prisma";
import {
  mapApplicationStageToUi,
  mapApplicationStatusToUi,
} from "@/lib/vacancy-applications/mappers";

export type CandidateParticipatingVacancyUi = {
  vacancyId: string;
  title: string;
  companyName: string;
  /** Human-readable status: postulación + etapa, y/o pipeline. */
  detailLine: string;
};

/**
 * Vacantes donde el candidato participa: postulaciones + vacante de pipeline (deduplicado).
 * Nunca lanza; errores → [].
 */
export async function listCandidateParticipatingVacanciesUi(
  candidateId: string,
  pipelineVacancyId: string | null | undefined,
): Promise<CandidateParticipatingVacancyUi[]> {
  const id = typeof candidateId === "string" ? candidateId.trim() : "";
  if (!id) return [];

  try {
    const apps = await prisma.vacancyApplication.findMany({
      where: { candidateId: id },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        vacancyId: true,
        stage: true,
        status: true,
        updatedAt: true,
        vacancy: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    });

    const sorted = [...apps].sort((a, b) => {
      const pri = (s: string) => (s === "ACTIVE" ? 0 : 1);
      const pa = pri(a.status);
      const pb = pri(b.status);
      if (pa !== pb) return pa - pb;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    const byVacancy = new Map<
      string,
      {
        title: string;
        companyName: string;
        applicationLine: string | null;
        pipelineNote: boolean;
      }
    >();

    for (const a of sorted) {
      if (byVacancy.has(a.vacancyId)) continue;
      const title = a.vacancy?.title?.trim() || "—";
      const companyName = a.vacancy?.company?.name?.trim() || "—";
      const appLine = `Postulación ${mapApplicationStatusToUi(a.status)} · ${mapApplicationStageToUi(a.stage)}`;
      byVacancy.set(a.vacancyId, {
        title,
        companyName,
        applicationLine: appLine,
        pipelineNote: false,
      });
    }

    const pid = pipelineVacancyId?.trim();
    if (pid) {
      const row = byVacancy.get(pid);
      if (row) {
        row.pipelineNote = true;
      } else {
        const v = await prisma.vacancy.findUnique({
          where: { id: pid },
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        });
        if (v) {
          byVacancy.set(pid, {
            title: v.title.trim() || "—",
            companyName: v.company?.name?.trim() || "—",
            applicationLine: null,
            pipelineNote: true,
          });
        }
      }
    }

    const out: CandidateParticipatingVacancyUi[] = [];
    for (const [vacancyId, r] of byVacancy) {
      const parts: string[] = [];
      if (r.applicationLine) parts.push(r.applicationLine);
      if (r.pipelineNote) parts.push("Vinculado en pipeline de reclutamiento");
      out.push({
        vacancyId,
        title: r.title,
        companyName: r.companyName,
        detailLine: parts.length > 0 ? parts.join(" · ") : "—",
      });
    }

    out.sort((a, b) => a.title.localeCompare(b.title, "es"));
    return out;
  } catch (err) {
    console.warn("[listCandidateParticipatingVacanciesUi] failed", {
      candidateId: id,
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
