import type { OpportunityStage } from "@/generated/prisma/enums";
import { OpportunityStage as StageConst } from "@/generated/prisma/enums";

const PRISMA_STAGE_VALUES = new Set<string>(Object.values(StageConst));

/** Spanish UI labels (same as `lib/opportunities/mappers.ts` → `OpportunityStageUi`). */
const UI_LABEL_TO_PRISMA: Record<string, OpportunityStage> = {
  Prospección: "PROSPECTING",
  Calificación: "QUALIFICATION",
  Propuesta: "PROPOSAL",
  Negociación: "NEGOTIATION",
  "Cerrada ganada": "CLOSED_WON",
  "Cerrada perdida": "CLOSED_LOST",
};

/**
 * Resolves API `stage` to a Prisma enum. Accepts Spanish UI labels or Prisma enum names
 * (case-insensitive). Returns null if missing/invalid (caller applies default).
 */
export function resolveOpportunityStageFromApi(
  raw: string | null | undefined,
): OpportunityStage | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const byUi = UI_LABEL_TO_PRISMA[trimmed];
  if (byUi) return byUi;

  const upper = trimmed.toUpperCase();
  if (PRISMA_STAGE_VALUES.has(upper)) {
    return upper as OpportunityStage;
  }

  return null;
}

export const DEFAULT_OPPORTUNITY_STAGE: OpportunityStage = "PROSPECTING";
