import type {
  CandidateRecruitmentStage,
  VacancyApplicationStage,
  VacancySeniority,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_RECRUITMENT_STAGE_LABELS } from "@/lib/candidates/constants";
import { formatAvailabilityBadgeLabel } from "@/lib/candidates/mappers";
import { mapApplicationStageToUi } from "@/lib/vacancy-applications/mappers";
import { prismaSeniorityToUi } from "@/lib/vacancies/mappers";

type VacancyCandidateInProcessRowInternal = {
  candidateId: string;
  displayName: string;
  role: string;
  seniorityLabel: string;
  recruitmentStageLabel: string;
  /** Etapa del embudo de postulación (VacancyApplication); null si solo está en pipeline. */
  selectionStageLabel: string | null;
  availabilityLabel: string;
  /** Orden estable: aplicaciones activas primero, luego pipeline sueltos. */
  sortKey: number;
};

export type VacancyCandidateInProcessRowUi = Omit<
  VacancyCandidateInProcessRowInternal,
  "sortKey"
>;

function recruitmentLabel(stage: CandidateRecruitmentStage): string {
  return CANDIDATE_RECRUITMENT_STAGE_LABELS[stage] ?? "—";
}

const STAGE_ORDER: VacancyApplicationStage[] = [
  "NEW",
  "PRE_SCREEN",
  "INTERNAL_INTERVIEW",
  "CLIENT_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

/**
 * Candidatos ligados a la vacante vía postulación activa o pipeline (pipelineVacancyId).
 * Nunca lanza: errores de Prisma → [] y log.
 */
export async function listCandidatesForVacancy(
  vacancyId: string,
): Promise<VacancyCandidateInProcessRowUi[]> {
  const id = vacancyId.trim();
  if (!id) return [];

  try {
    const applications = await prisma.vacancyApplication.findMany({
      where: {
        vacancyId: id,
        status: "ACTIVE",
      },
      select: {
        stage: true,
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            seniority: true,
            availabilityStatus: true,
            availabilityStartDate: true,
            recruitmentStage: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    const fromApps: VacancyCandidateInProcessRowInternal[] = applications.map(
      (a) => {
        const c = a.candidate;
        const displayName = `${c.firstName} ${c.lastName}`.trim() || "—";
        return {
          candidateId: c.id,
          displayName,
          role: c.role?.trim() || "—",
          seniorityLabel: prismaSeniorityToUi[c.seniority as VacancySeniority],
          recruitmentStageLabel: recruitmentLabel(
            c.recruitmentStage as CandidateRecruitmentStage,
          ),
          selectionStageLabel: mapApplicationStageToUi(a.stage),
          availabilityLabel: formatAvailabilityBadgeLabel(
            c.availabilityStatus,
            c.availabilityStartDate,
          ),
          sortKey: STAGE_ORDER.indexOf(a.stage),
        };
      },
    );

    const appCandidateIds = new Set(fromApps.map((r) => r.candidateId));

    const pipelineOnly = await prisma.candidate.findMany({
      where: {
        pipelineVacancyId: id,
        ...(appCandidateIds.size > 0
          ? { id: { notIn: [...appCandidateIds] } }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        seniority: true,
        availabilityStatus: true,
        availabilityStartDate: true,
        recruitmentStage: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const fromPipeline: VacancyCandidateInProcessRowInternal[] =
      pipelineOnly.map((c) => {
        const displayName = `${c.firstName} ${c.lastName}`.trim() || "—";
        return {
          candidateId: c.id,
          displayName,
          role: c.role?.trim() || "—",
          seniorityLabel: prismaSeniorityToUi[c.seniority as VacancySeniority],
          recruitmentStageLabel: recruitmentLabel(
            c.recruitmentStage as CandidateRecruitmentStage,
          ),
          selectionStageLabel: null,
          availabilityLabel: formatAvailabilityBadgeLabel(
            c.availabilityStatus,
            c.availabilityStartDate,
          ),
          sortKey: 100 + STAGE_ORDER.length,
        };
      });

    const merged = [...fromApps, ...fromPipeline].sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return a.displayName.localeCompare(b.displayName, "es");
    });

    return merged.map(
      ({ sortKey: _s, ...row }): VacancyCandidateInProcessRowUi => row,
    );
  } catch (err) {
    console.error("[listCandidatesForVacancy] failed", err);
    return [];
  }
}
