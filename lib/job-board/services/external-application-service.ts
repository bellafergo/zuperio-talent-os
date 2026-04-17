import type { JobBoardProvider, VacancyApplicationStage } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { jobBoardProviderLabel } from "../labels";

export type IngestExternalApplicationInput = {
  provider: JobBoardProvider;
  externalApplicationId: string;
  externalVacancyRef?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  sourcePayload?: unknown;
  vacancyId?: string | null;
};

/**
 * Idempotent intake by (provider, externalApplicationId). Safe to call from future webhooks.
 */
export async function ingestExternalApplication(input: IngestExternalApplicationInput) {
  const payload =
    input.sourcePayload === undefined
      ? undefined
      : (input.sourcePayload as object);

  return prisma.externalApplication.upsert({
    where: {
      provider_externalApplicationId: {
        provider: input.provider,
        externalApplicationId: input.externalApplicationId,
      },
    },
    create: {
      provider: input.provider,
      externalApplicationId: input.externalApplicationId,
      externalVacancyRef: input.externalVacancyRef ?? null,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      sourcePayload: payload,
      vacancyId: input.vacancyId ?? null,
      status: input.vacancyId ? "VACANCY_MAPPED" : "PENDING_MAPPING",
    },
    update: {
      externalVacancyRef: input.externalVacancyRef ?? null,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      sourcePayload: payload,
      vacancyId: input.vacancyId ?? undefined,
      status: input.vacancyId ? "VACANCY_MAPPED" : undefined,
      lastError: null,
    },
  });
}

export type MapExternalApplicationToPipelineInput = {
  externalApplicationId: string;
  /** If omitted, uses the row's linked vacancyId (must be set). */
  vacancyId?: string;
  /** If set, attaches that candidate; otherwise creates a minimal internal candidate. */
  candidateId?: string;
  initialStage?: VacancyApplicationStage;
};

/**
 * Links external application → internal vacancy + candidate + VacancyApplication.
 * Isolated in this module so provider adapters stay thin.
 */
export async function mapExternalApplicationToInternalPipeline(
  input: MapExternalApplicationToPipelineInput,
): Promise<{ vacancyApplicationId: string; candidateId: string }> {
  const ext = await prisma.externalApplication.findUnique({
    where: { id: input.externalApplicationId },
    include: {
      vacancy: { select: { id: true, seniority: true, title: true } },
    },
  });

  if (!ext) {
    throw new Error("External application not found");
  }

  if (ext.vacancyApplicationId) {
    const cid = ext.candidateId;
    if (!cid) {
      throw new Error("External application linked to pipeline but candidateId is missing");
    }
    return {
      vacancyApplicationId: ext.vacancyApplicationId,
      candidateId: cid,
    };
  }

  const vacancyId = input.vacancyId ?? ext.vacancyId;
  if (!vacancyId) {
    throw new Error("Vacancy not mapped for this external application");
  }

  const vacancy =
    ext.vacancy?.id === vacancyId
      ? ext.vacancy
      : await prisma.vacancy.findUnique({
          where: { id: vacancyId },
          select: { id: true, seniority: true, title: true },
        });

  if (!vacancy) {
    throw new Error("Vacancy not found");
  }

  return prisma.$transaction(async (tx) => {
    let candidateId = input.candidateId ?? ext.candidateId ?? null;

    if (!candidateId) {
      const created = await tx.candidate.create({
        data: {
          firstName: ext.firstName.trim() || "Candidato",
          lastName: ext.lastName.trim() || "Externo",
          email: ext.email?.trim() || null,
          phone: ext.phone?.trim() || null,
          role: vacancy.title.slice(0, 120),
          seniority: vacancy.seniority,
          skills: "",
        },
      });
      candidateId = created.id;
    }

    const existingActive = await tx.vacancyApplication.findFirst({
      where: {
        vacancyId,
        candidateId,
        status: "ACTIVE",
      },
    });

    if (existingActive) {
      await tx.externalApplication.update({
        where: { id: ext.id },
        data: {
          candidateId,
          vacancyId,
          vacancyApplicationId: existingActive.id,
          status: "PROMOTED_TO_PIPELINE",
          lastError: null,
        },
      });
      return {
        vacancyApplicationId: existingActive.id,
        candidateId,
      };
    }

    const app = await tx.vacancyApplication.create({
      data: {
        vacancyId,
        candidateId,
        stage: input.initialStage ?? "NEW",
        status: "ACTIVE",
        source: `Bolsa externa: ${jobBoardProviderLabel(ext.provider)}`,
      },
    });

    await tx.externalApplication.update({
      where: { id: ext.id },
      data: {
        candidateId,
        vacancyId,
        vacancyApplicationId: app.id,
        status: "PROMOTED_TO_PIPELINE",
        lastError: null,
      },
    });

    return { vacancyApplicationId: app.id, candidateId };
  });
}
