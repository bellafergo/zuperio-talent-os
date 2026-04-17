import type { OpportunityStage } from "@/generated/prisma/enums";

import {
  DEFAULT_OPPORTUNITY_STAGE,
  resolveOpportunityStageFromApi,
} from "./opportunity-stage-from-api";

export type LeadApiCompany = {
  name: string;
  website?: string | null;
};

export type LeadApiContact = {
  firstName: string;
  lastName: string | null;
  email: string;
  phone?: string | null;
  position?: string | null;
};

export type LeadApiOpportunity = {
  title: string;
  value?: number | null;
  stage?: string | null;
  source?: string | null;
  currency?: string | null;
};

export type ParsedLeadPayload = {
  company: LeadApiCompany;
  contact: LeadApiContact;
  opportunity: LeadApiOpportunity;
  resolvedStage: OpportunityStage;
};

export type ParseLeadBodyResult =
  | { ok: true; data: ParsedLeadPayload }
  | { ok: false; message: string };

/** Strips common markdown / mailto noise from pasted emails. */
export function normalizeLeadEmail(raw: string): string {
  const trimmed = raw.trim();
  const mailto = trimmed.match(/mailto:([^\s)>]+)/i);
  if (mailto?.[1]) return mailto[1].trim().toLowerCase();
  const inBrackets = trimmed.match(/^\[([^\]]+)]/);
  if (inBrackets?.[1]?.includes("@")) return inBrackets[1].trim().toLowerCase();
  return trimmed.toLowerCase();
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function splitContactName(full: string): { firstName: string; lastName: string | null } {
  const t = full.trim();
  const idx = t.indexOf(" ");
  if (idx === -1) return { firstName: t, lastName: null };
  return {
    firstName: t.slice(0, idx).trim(),
    lastName: t.slice(idx + 1).trim() || null,
  };
}

function parseOptionalString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function parseOptionalNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    return Number.isFinite(v) && v >= 0 ? v : null;
  }
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function parseLeadRequestBody(body: unknown): ParseLeadBodyResult {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "JSON body must be an object." };
  }

  const b = body as Record<string, unknown>;
  const companyRaw = b.company;
  const contactRaw = b.contact;
  const opportunityRaw = b.opportunity;

  if (companyRaw == null || typeof companyRaw !== "object" || Array.isArray(companyRaw)) {
    return { ok: false, message: "`company` is required and must be an object." };
  }
  if (contactRaw == null || typeof contactRaw !== "object" || Array.isArray(contactRaw)) {
    return { ok: false, message: "`contact` is required and must be an object." };
  }
  if (
    opportunityRaw == null ||
    typeof opportunityRaw !== "object" ||
    Array.isArray(opportunityRaw)
  ) {
    return { ok: false, message: "`opportunity` is required and must be an object." };
  }

  const co = companyRaw as Record<string, unknown>;
  const ct = contactRaw as Record<string, unknown>;
  const op = opportunityRaw as Record<string, unknown>;

  if (!isNonEmptyString(co.name)) {
    return { ok: false, message: "`company.name` is required." };
  }

  if (!isNonEmptyString(ct.name)) {
    return { ok: false, message: "`contact.name` is required." };
  }
  if (!isNonEmptyString(ct.email)) {
    return { ok: false, message: "`contact.email` is required." };
  }

  const email = normalizeLeadEmail(ct.email);
  if (!looksLikeEmail(email)) {
    return { ok: false, message: "`contact.email` is not a valid email address." };
  }

  if (!isNonEmptyString(op.title)) {
    return { ok: false, message: "`opportunity.title` is required." };
  }

  const stageRaw = parseOptionalString(op.stage);
  const resolved =
    resolveOpportunityStageFromApi(stageRaw) ??
    (stageRaw ? null : DEFAULT_OPPORTUNITY_STAGE);

  if (!resolved) {
    return {
      ok: false,
      message:
        "`opportunity.stage` is invalid. Use a Spanish label (e.g. \"Prospección\") or a Prisma stage (e.g. PROSPECTING).",
    };
  }

  const value = parseOptionalNumber(op.value);
  if (op.value != null && op.value !== "" && value === null) {
    return { ok: false, message: "`opportunity.value` must be a non-negative number." };
  }

  const currency = (parseOptionalString(op.currency) ?? "MXN").toUpperCase();
  if (currency !== "MXN" && currency !== "USD") {
    return { ok: false, message: "`opportunity.currency` must be MXN or USD when provided." };
  }

  return {
    ok: true,
    data: {
      company: {
        name: (co.name as string).trim(),
        website: parseOptionalString(co.website),
      },
      contact: {
        ...splitContactName(ct.name as string),
        email,
        phone: parseOptionalString(ct.phone),
        position: parseOptionalString(ct.position),
      },
      opportunity: {
        title: (op.title as string).trim(),
        value,
        stage: stageRaw,
        source: parseOptionalString(op.source),
        currency,
      },
      resolvedStage: resolved,
    },
  };
}
