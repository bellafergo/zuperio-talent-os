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
