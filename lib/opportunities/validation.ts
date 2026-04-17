import {
  OpportunityStage as StageConst,
  type OpportunityStage,
} from "@/generated/prisma/enums";

const STAGE_SET = new Set<string>(Object.values(StageConst));

export type OpportunityFormParsed = {
  title: string;
  companyId: string;
  ownerId: string | null;
  stage: OpportunityStage;
  value: number | null;
  currency: string;
};

export type OpportunityFormValidationResult =
  | { ok: true; data: OpportunityFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function parseRequiredTrimmed(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export function parseOpportunityForm(
  formData: FormData,
): OpportunityFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const title = parseRequiredTrimmed(formData, "title");
  if (!title) fieldErrors.title = "Title is required.";

  const companyId = parseRequiredTrimmed(formData, "companyId");
  if (!companyId) fieldErrors.companyId = "Company is required.";

  const ownerRaw = parseOptionalTrimmed(formData, "ownerId");
  const ownerId = ownerRaw ? ownerRaw : null;

  const stageRaw = parseOptionalTrimmed(formData, "stage") ?? "";
  if (!stageRaw || !STAGE_SET.has(stageRaw)) {
    fieldErrors.stage = "Select a valid stage.";
  }

  const valueRaw = parseOptionalTrimmed(formData, "value");
  let value: number | null = null;
  if (valueRaw) {
    const n = Number(valueRaw);
    if (!Number.isFinite(n) || n < 0) {
      fieldErrors.value = "Enter a valid value (0 or higher).";
    } else {
      value = n;
    }
  }

  const currencyRaw = parseOptionalTrimmed(formData, "currency");
  let currency = "MXN";
  if (currencyRaw) {
    const c = currencyRaw.toUpperCase();
    if (c !== "MXN" && c !== "USD") {
      fieldErrors.currency = "La moneda debe ser MXN o USD.";
    } else {
      currency = c;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      title,
      companyId,
      ownerId,
      stage: stageRaw as OpportunityStage,
      value,
      currency,
    },
  };
}

