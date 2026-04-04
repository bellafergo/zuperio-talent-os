import type { CandidateEditData } from "./queries";
import type { CandidateSkillDraft } from "./validation";

/** Heuristic autofill payload returned by preview API and used client-side. */
export type CvAutofillSuggestions = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
  locationCity?: string;
  workModality?: string;
  cvLanguagesText?: string;
  cvCertificationsText?: string;
  cvEducationText?: string;
  /** Comma / semicolon separated skill names for catalog matching on the client. */
  skillsLine?: string;
};

/** Fields that can receive CV autofill in the form (string-backed inputs). */
export type CvAutofillProvenanceField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "role"
  | "notes"
  | "locationCity"
  | "workModality"
  | "cvLanguagesText"
  | "cvCertificationsText"
  | "cvEducationText"
  | "cvIndustriesText"
  | "cvSoftSkillsText";

/** Compact summary after extraction (for review before save). */
export type CvExtractionSummary = {
  displayName: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  skillsTokensDetected: number;
  skillsCatalogMatches: number;
  languageLinesDetected: number;
  certificationLinesDetected: number;
};

export type CvAutofillApplyPayload = {
  patch: Partial<CandidateEditData>;
  extraStructuredSkills: CandidateSkillDraft[];
  provenanceKeys: CvAutofillProvenanceField[];
  summary: CvExtractionSummary | null;
  structuredSkillsAddedCount: number;
  skippedFilledFieldCount: number;
  /** When false, parent must not merge patch or bump applyId (nothing to apply). */
  applyValues: boolean;
};

export type CvExtractPreviewOk = {
  ok: true;
  source: "pdf" | "unsupported" | "empty";
  suggestions: CvAutofillSuggestions;
};

export type CvExtractPreviewErr = {
  ok: false;
  error: string;
};

export type CvExtractPreviewResponse = CvExtractPreviewOk | CvExtractPreviewErr;
