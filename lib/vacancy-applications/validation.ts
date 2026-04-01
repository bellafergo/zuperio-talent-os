import {
  VacancyApplicationStage as StageConst,
  VacancyApplicationStatus as StatusConst,
  type VacancyApplicationStage,
  type VacancyApplicationStatus,
} from "@/generated/prisma/enums";

const STAGE_SET = new Set<string>(Object.values(StageConst));
const STATUS_SET = new Set<string>(Object.values(StatusConst));

export type ApplicationUpdateParsed = {
  applicationId: string;
  stage: VacancyApplicationStage;
  status: VacancyApplicationStatus;
  source: string | null;
  notes: string | null;
};

export type ApplicationUpdateValidationResult =
  | { ok: true; data: ApplicationUpdateParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

export function parseApplicationUpdateForm(
  formData: FormData,
): ApplicationUpdateValidationResult {
  const fieldErrors: Record<string, string> = {};

  const idRaw = formData.get("applicationId");
  const applicationId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!applicationId) fieldErrors.applicationId = "Missing application id.";

  const stageRaw = parseOptionalTrimmed(formData, "stage") ?? "";
  if (!stageRaw || !STAGE_SET.has(stageRaw)) {
    fieldErrors.stage = "Select a valid stage.";
  }

  const statusRaw = parseOptionalTrimmed(formData, "status") ?? "";
  if (!statusRaw || !STATUS_SET.has(statusRaw)) {
    fieldErrors.status = "Select a valid status.";
  }

  const sourceRaw = parseOptionalTrimmed(formData, "source");
  const notesRaw = parseOptionalTrimmed(formData, "notes");

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      applicationId,
      stage: stageRaw as VacancyApplicationStage,
      status: statusRaw as VacancyApplicationStatus,
      source: sourceRaw ? sourceRaw.slice(0, 200) : null,
      notes: notesRaw ? notesRaw.slice(0, 2000) : null,
    },
  };
}

