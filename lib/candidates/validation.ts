import {
  CandidatePipelineIntent as PipelineIntentConst,
  VacancySeniority as SeniorityConst,
  type CandidateAvailabilityStatus,
  type CandidatePipelineIntent,
  type VacancySeniority,
} from "@/generated/prisma/enums";

export type CandidateSkillDraft = {
  skillId: string;
  yearsExperience: number | null;
  level: string | null;
};

const SENIORITY_SET = new Set<string>(Object.values(SeniorityConst));
const PIPELINE_INTENT_SET = new Set<string>(Object.values(PipelineIntentConst));

const AVAILABILITY_MODE_SET = new Set<string>([
  "IMMEDIATE",
  "TWO_WEEKS",
  "SPECIFIC_DATE",
  "NOT_AVAILABLE",
]);

export type CandidateAvailabilityFormMode =
  | "IMMEDIATE"
  | "TWO_WEEKS"
  | "SPECIFIC_DATE"
  | "NOT_AVAILABLE";

function startOfUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDaysUTC(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86400000);
}

/**
 * Maps UX availability mode + optional calendar value into persisted enum + optional start date.
 */
export function computeAvailabilityForPersistence(
  mode: CandidateAvailabilityFormMode,
  specificDateYmd: string | null,
  now: Date = new Date(),
):
  | { ok: true; availabilityStatus: CandidateAvailabilityStatus; availabilityStartDate: Date | null }
  | { ok: false; fieldErrors: Record<string, string> } {
  if (mode === "NOT_AVAILABLE") {
    return {
      ok: true,
      availabilityStatus: "NOT_AVAILABLE",
      availabilityStartDate: null,
    };
  }
  if (mode === "IMMEDIATE") {
    return {
      ok: true,
      availabilityStatus: "AVAILABLE",
      availabilityStartDate: null,
    };
  }
  if (mode === "TWO_WEEKS") {
    const start = startOfUTCDay(now);
    const plus14 = addDaysUTC(start, 14);
    return {
      ok: true,
      availabilityStatus: "AVAILABLE",
      availabilityStartDate: plus14,
    };
  }
  const ymd = specificDateYmd?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return {
      ok: false,
      fieldErrors: {
        availabilitySpecificDate: "Selecciona una fecha válida.",
      },
    };
  }
  const [ys, ms, ds] = ymd.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) {
    return {
      ok: false,
      fieldErrors: { availabilitySpecificDate: "La fecha no es válida." },
    };
  }
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return {
      ok: false,
      fieldErrors: { availabilitySpecificDate: "La fecha no es válida." },
    };
  }
  return {
    ok: true,
    availabilityStatus: "AVAILABLE",
    availabilityStartDate: dt,
  };
}

const CV_TEXT_MAX = 6000;

export type CandidateFormParsed = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniority: VacancySeniority;
  availabilityMode: CandidateAvailabilityFormMode;
  availabilitySpecificDate: string | null;
  pipelineIntent: CandidatePipelineIntent;
  pipelineVacancyId: string | null;
  currentCompany: string | null;
  notes: string | null;
  structuredSkills: CandidateSkillDraft[];
  locationCity: string | null;
  workModality: string | null;
  cvLanguagesText: string | null;
  cvCertificationsText: string | null;
  cvIndustriesText: string | null;
  cvEducationText: string | null;
  cvSoftSkillsText: string | null;
};

export type CandidateFormValidationResult =
  | { ok: true; data: CandidateFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function parseOptionalLongText(
  formData: FormData,
  key: string,
  fieldLabel: string,
  max: number,
  fieldErrors: Record<string, string>,
): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v) return null;
  if (v.length > max) {
    fieldErrors[key] = `${fieldLabel} excede ${max} caracteres.`;
    return null;
  }
  return v;
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

function looksLikeEmail(email: string): boolean {
  // Minimal sanity check (no heavy validation).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseSkillsJson(
  raw: string | null,
): { ok: true; value: CandidateSkillDraft[] } | { ok: false } {
  if (!raw) return { ok: true, value: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: false };
    const out: CandidateSkillDraft[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (!item || typeof item !== "object") return { ok: false };
      const skillId = (item as { skillId?: unknown }).skillId;
      const yearsExperience = (item as { yearsExperience?: unknown }).yearsExperience;
      const level = (item as { level?: unknown }).level;

      if (typeof skillId !== "string" || !skillId.trim()) return { ok: false };
      const sid = skillId.trim();
      if (seen.has(sid)) return { ok: false };
      seen.add(sid);

      let years: number | null = null;
      if (yearsExperience === null || yearsExperience === undefined || yearsExperience === "") {
        years = null;
      } else if (typeof yearsExperience === "number" && Number.isFinite(yearsExperience)) {
        years = yearsExperience;
      } else if (typeof yearsExperience === "string" && yearsExperience.trim()) {
        const n = Number(yearsExperience);
        if (!Number.isFinite(n)) return { ok: false };
        years = n;
      } else {
        return { ok: false };
      }
      if (years != null) {
        const normalized = Math.floor(years);
        if (normalized < 0 || normalized > 50) return { ok: false };
        years = normalized;
      }

      let lvl: string | null = null;
      if (typeof level === "string" && level.trim()) {
        lvl = level.trim().slice(0, 50);
      } else if (level === null || level === undefined || level === "") {
        lvl = null;
      } else {
        return { ok: false };
      }

      out.push({ skillId: sid, yearsExperience: years, level: lvl });
    }
    return { ok: true, value: out };
  } catch {
    return { ok: false };
  }
}

export function parseCandidateForm(formData: FormData): CandidateFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const firstNameRes = parseRequiredTrimmed(formData, "firstName");
  if (!firstNameRes.ok) fieldErrors.firstName = "First name is required.";
  const firstName = firstNameRes.ok ? firstNameRes.value : "";

  const lastName = parseOptionalTrimmed(formData, "lastName") ?? "";

  const roleRes = parseRequiredTrimmed(formData, "role");
  if (!roleRes.ok) fieldErrors.role = "Role is required.";
  const role = roleRes.ok ? roleRes.value : "";

  const seniorityRaw = parseOptionalTrimmed(formData, "seniority") ?? "";
  if (!seniorityRaw || !SENIORITY_SET.has(seniorityRaw)) {
    fieldErrors.seniority = "Select a valid seniority.";
  }

  const availabilityModeRaw = parseOptionalTrimmed(formData, "availabilityMode") ?? "";
  if (!availabilityModeRaw || !AVAILABILITY_MODE_SET.has(availabilityModeRaw)) {
    fieldErrors.availabilityMode = "Selecciona una opción de disponibilidad.";
  }
  const availabilityMode = availabilityModeRaw as CandidateAvailabilityFormMode;

  const availabilitySpecificDate = parseOptionalTrimmed(
    formData,
    "availabilitySpecificDate",
  );
  if (availabilityMode === "SPECIFIC_DATE") {
    const ymd = availabilitySpecificDate ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      fieldErrors.availabilitySpecificDate = "Selecciona una fecha.";
    }
  }

  const pipelineIntentRaw = parseOptionalTrimmed(formData, "pipelineIntent") ?? "";
  if (!pipelineIntentRaw || !PIPELINE_INTENT_SET.has(pipelineIntentRaw)) {
    fieldErrors.pipelineIntent = "Selecciona el contexto de reclutamiento.";
  }
  const pipelineIntent = pipelineIntentRaw as CandidatePipelineIntent;

  const pipelineVacancyRaw = parseOptionalTrimmed(formData, "pipelineVacancyId");
  let pipelineVacancyId: string | null = null;
  if (pipelineIntent === "OPEN_VACANCY") {
    if (!pipelineVacancyRaw) {
      fieldErrors.pipelineVacancyId = "Selecciona una vacante abierta.";
    } else {
      pipelineVacancyId = pipelineVacancyRaw;
    }
  }

  const emailRaw = parseOptionalTrimmed(formData, "email");
  let email: string | null = null;
  if (emailRaw) {
    if (!looksLikeEmail(emailRaw)) {
      fieldErrors.email = "Enter a valid email address.";
    } else {
      email = emailRaw.toLowerCase();
    }
  }

  const phone = parseOptionalTrimmed(formData, "phone");
  const currentCompany = parseOptionalTrimmed(formData, "currentCompanyHidden");

  const notesRaw = parseOptionalTrimmed(formData, "notes");
  const notes = notesRaw ? notesRaw : null;

  const locationCity = parseOptionalTrimmed(formData, "locationCity");
  const workModalityRaw = parseOptionalTrimmed(formData, "workModality");
  let workModality: string | null = null;
  if (workModalityRaw) {
    if (workModalityRaw.length > 120) {
      fieldErrors.workModality = "Modalidad: máximo 120 caracteres.";
    } else {
      workModality = workModalityRaw;
    }
  }
  const cvLanguagesText = parseOptionalLongText(
    formData,
    "cvLanguagesText",
    "Idiomas (CV)",
    CV_TEXT_MAX,
    fieldErrors,
  );
  const cvCertificationsText = parseOptionalLongText(
    formData,
    "cvCertificationsText",
    "Certificaciones (CV)",
    CV_TEXT_MAX,
    fieldErrors,
  );
  const cvIndustriesText = parseOptionalLongText(
    formData,
    "cvIndustriesText",
    "Industrias (CV)",
    CV_TEXT_MAX,
    fieldErrors,
  );
  const cvEducationText = parseOptionalLongText(
    formData,
    "cvEducationText",
    "Educación (CV)",
    CV_TEXT_MAX,
    fieldErrors,
  );
  const cvSoftSkillsText = parseOptionalLongText(
    formData,
    "cvSoftSkillsText",
    "Habilidades blandas (CV)",
    CV_TEXT_MAX,
    fieldErrors,
  );

  const skillsJsonRaw = parseOptionalTrimmed(formData, "structuredSkills");
  const skillsParsed = parseSkillsJson(skillsJsonRaw);
  if (!skillsParsed.ok) {
    fieldErrors.structuredSkills = "Structured skills payload is invalid.";
  }
  const structuredSkills = skillsParsed.ok ? skillsParsed.value : [];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      email,
      phone,
      role,
      seniority: seniorityRaw as VacancySeniority,
      availabilityMode,
      availabilitySpecificDate,
      pipelineIntent,
      pipelineVacancyId,
      currentCompany,
      notes,
      structuredSkills,
      locationCity,
      workModality,
      cvLanguagesText,
      cvCertificationsText,
      cvIndustriesText,
      cvEducationText,
      cvSoftSkillsText,
    },
  };
}

