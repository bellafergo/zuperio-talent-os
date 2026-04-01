import {
  PlacementStatus as StatusConst,
  type PlacementStatus,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(StatusConst));

export type PlacementFormParsed = {
  candidateId: string;
  vacancyId: string;
  companyId: string;
  startDate: Date;
  endDate: Date | null;
  status: PlacementStatus;
  rateClient: number | null;
  rateCandidate: number | null;
};

export type PlacementFormValidationResult =
  | { ok: true; data: PlacementFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseRequiredId(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function parseOptionalNumber(value: string | null): number | null | "invalid" {
  if (!value) return null;
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return "invalid";
  return n;
}

export function parsePlacementForm(formData: FormData): PlacementFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const candidateId = parseRequiredId(formData, "candidateId");
  if (!candidateId) fieldErrors.candidateId = "Candidate is required.";

  const vacancyId = parseRequiredId(formData, "vacancyId");
  if (!vacancyId) fieldErrors.vacancyId = "Vacancy is required.";

  const companyId = parseRequiredId(formData, "companyId");
  if (!companyId) fieldErrors.companyId = "Company is required.";

  const startRaw = parseRequiredId(formData, "startDate");
  const startDate = startRaw ? parseDateInput(startRaw) : null;
  if (!startDate) fieldErrors.startDate = "Start date is required.";

  const endRaw = parseRequiredId(formData, "endDate");
  const endDate = endRaw ? parseDateInput(endRaw) : null;
  if (endRaw && !endDate) fieldErrors.endDate = "End date must be a valid date.";

  const statusRaw = parseRequiredId(formData, "status");
  if (!statusRaw || !STATUS_SET.has(statusRaw)) {
    fieldErrors.status = "Select a valid status.";
  }

  const rateClientRaw = formData.get("rateClient");
  const rateClientVal =
    typeof rateClientRaw === "string" ? parseOptionalNumber(rateClientRaw) : null;
  if (rateClientVal === "invalid" || (typeof rateClientVal === "number" && rateClientVal < 0)) {
    fieldErrors.rateClient = "Enter a valid client rate (0 or higher).";
  }

  const rateCandidateRaw = formData.get("rateCandidate");
  const rateCandidateVal =
    typeof rateCandidateRaw === "string" ? parseOptionalNumber(rateCandidateRaw) : null;
  if (
    rateCandidateVal === "invalid" ||
    (typeof rateCandidateVal === "number" && rateCandidateVal < 0)
  ) {
    fieldErrors.rateCandidate = "Enter a valid candidate rate (0 or higher).";
  }

  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    fieldErrors.endDate = "End date cannot be before start date.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      candidateId,
      vacancyId,
      companyId,
      startDate: startDate!,
      endDate,
      status: statusRaw as PlacementStatus,
      rateClient: typeof rateClientVal === "number" ? rateClientVal : null,
      rateCandidate: typeof rateCandidateVal === "number" ? rateCandidateVal : null,
    },
  };
}

