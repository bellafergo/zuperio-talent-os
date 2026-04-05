import {
  VacancySeniority as VacancySeniorityConst,
  VacancyStatus as VacancyStatusConst,
  type VacancySeniority,
  type VacancyStatus,
} from "@/generated/prisma/enums";

import type { VacancyRequirementDraft } from "./types";

const STATUS_SET = new Set<string>(Object.values(VacancyStatusConst));
const SENIORITY_SET = new Set<string>(Object.values(VacancySeniorityConst));

export type VacancyFormParsed = {
  title: string;
  companyId: string;
  opportunityId: string | null;
  contactId: string | null;
  seniority: VacancySeniority;
  status: VacancyStatus;
  targetRate: number | null;
  currency: string | null;
  roleSummary: string | null;
  workModality: string | null;
  requirements: VacancyRequirementDraft[];
};

export type VacancyFormValidationResult =
  | { ok: true; data: VacancyFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function parseRequiredTrimmed(
  formData: FormData,
  key: string,
): { ok: true; value: string } | { ok: false } {
  const raw = formData.get(key);
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return { ok: false };
  return { ok: true, value: v };
}

function parseRequirementsJson(
  raw: string | null,
): { ok: true; value: VacancyRequirementDraft[] } | { ok: false } {
  if (!raw) return { ok: true, value: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: false };
    const out: VacancyRequirementDraft[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (!item || typeof item !== "object") return { ok: false };
      const skillId = (item as { skillId?: unknown }).skillId;
      const required = (item as { required?: unknown }).required;
      const minimumYears = (item as { minimumYears?: unknown }).minimumYears;
      if (typeof skillId !== "string" || !skillId.trim()) return { ok: false };
      const sid = skillId.trim();
      if (seen.has(sid)) return { ok: false };
      seen.add(sid);
      if (typeof required !== "boolean") return { ok: false };
      let min: number | null = null;
      if (minimumYears === null || minimumYears === undefined || minimumYears === "") {
        min = null;
      } else if (typeof minimumYears === "number" && Number.isFinite(minimumYears)) {
        min = minimumYears;
      } else if (typeof minimumYears === "string" && minimumYears.trim()) {
        const n = Number(minimumYears);
        if (!Number.isFinite(n)) return { ok: false };
        min = n;
      } else {
        return { ok: false };
      }
      if (min != null) {
        const normalized = Math.floor(min);
        if (normalized < 0 || normalized > 50) return { ok: false };
        min = normalized;
      }
      out.push({ skillId: sid, required, minimumYears: min });
    }
    return { ok: true, value: out };
  } catch {
    return { ok: false };
  }
}

export function parseVacancyForm(formData: FormData): VacancyFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const titleRes = parseRequiredTrimmed(formData, "title");
  if (!titleRes.ok) fieldErrors.title = "Title is required.";
  const title = titleRes.ok ? titleRes.value : "";

  const companyRes = parseRequiredTrimmed(formData, "companyId");
  if (!companyRes.ok) fieldErrors.companyId = "La empresa es obligatoria.";
  const companyId = companyRes.ok ? companyRes.value : "";

  const opportunityId = parseOptionalTrimmed(formData, "opportunityId");
  const contactId = parseOptionalTrimmed(formData, "contactId");

  const seniorityRaw = parseOptionalTrimmed(formData, "seniority") ?? "";
  if (!seniorityRaw || !SENIORITY_SET.has(seniorityRaw)) {
    fieldErrors.seniority = "Select a valid seniority.";
  }

  const statusRaw = parseOptionalTrimmed(formData, "status") ?? "";
  if (!statusRaw || !STATUS_SET.has(statusRaw)) {
    fieldErrors.status = "Select a valid status.";
  }

  const targetRateRaw = parseOptionalTrimmed(formData, "targetRate");
  let targetRate: number | null = null;
  if (targetRateRaw) {
    const n = Number(targetRateRaw);
    if (!Number.isFinite(n) || n < 0) {
      fieldErrors.targetRate = "Enter a valid rate (0 or higher).";
    } else {
      targetRate = n;
    }
  }

  const currencyRaw = parseOptionalTrimmed(formData, "currency");
  let currency: string | null = "MXN";
  if (currencyRaw) {
    const c = currencyRaw.toUpperCase();
    if (c !== "MXN" && c !== "USD") {
      fieldErrors.currency = "La moneda debe ser MXN o USD.";
    } else {
      currency = c;
    }
  }

  const roleSummaryRaw = parseOptionalTrimmed(formData, "roleSummary");
  const roleSummary = roleSummaryRaw ? roleSummaryRaw : null;

  const workModalityRaw = parseOptionalTrimmed(formData, "workModality");
  let workModality = workModalityRaw;
  if (workModality && workModality.length > 120) {
    fieldErrors.workModality = "Modalidad: máximo 120 caracteres.";
    workModality = null;
  }

  const reqJsonRaw = parseOptionalTrimmed(formData, "requirements");
  const reqParsed = parseRequirementsJson(reqJsonRaw);
  if (!reqParsed.ok) {
    fieldErrors.requirements = "Requirements payload is invalid.";
  }
  const requirements = reqParsed.ok ? reqParsed.value : [];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      title,
      companyId,
      opportunityId,
      contactId,
      seniority: seniorityRaw as VacancySeniority,
      status: statusRaw as VacancyStatus,
      targetRate,
      currency,
      roleSummary,
      workModality,
      requirements,
    },
  };
}

