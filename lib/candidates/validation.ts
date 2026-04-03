import {
  CandidateAvailabilityStatus as AvailabilityConst,
  VacancySeniority as SeniorityConst,
  type CandidateAvailabilityStatus,
  type VacancySeniority,
} from "@/generated/prisma/enums";

export type CandidateSkillDraft = {
  skillId: string;
  yearsExperience: number | null;
  level: string | null;
};

const AVAILABILITY_SET = new Set<string>(Object.values(AvailabilityConst));
const SENIORITY_SET = new Set<string>(Object.values(SeniorityConst));

const CV_TEXT_MAX = 6000;

export type CandidateFormParsed = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniority: VacancySeniority;
  availabilityStatus: CandidateAvailabilityStatus;
  currentCompany: string | null;
  notes: string | null;
  structuredSkills: CandidateSkillDraft[];
  locationCity: string | null;
  workModality: string | null;
  cvLanguagesText: string | null;
  cvCertificationsText: string | null;
  cvIndustriesText: string | null;
  cvEducationText: string | null;
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

  const availabilityRaw = parseOptionalTrimmed(formData, "availabilityStatus") ?? "";
  if (!availabilityRaw || !AVAILABILITY_SET.has(availabilityRaw)) {
    fieldErrors.availabilityStatus = "Select a valid availability status.";
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
  const currentCompany = parseOptionalTrimmed(formData, "currentCompany");

  const notesRaw = parseOptionalTrimmed(formData, "notes");
  const notes = notesRaw ? notesRaw : null;

  const locationCity = parseOptionalTrimmed(formData, "locationCity");
  const workModality = parseOptionalTrimmed(formData, "workModality");
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
      availabilityStatus: availabilityRaw as CandidateAvailabilityStatus,
      currentCompany,
      notes,
      structuredSkills,
      locationCity,
      workModality,
      cvLanguagesText,
      cvCertificationsText,
      cvIndustriesText,
      cvEducationText,
    },
  };
}

