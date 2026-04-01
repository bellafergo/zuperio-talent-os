import {
  ContactStatus as StatusConst,
  type ContactStatus,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(StatusConst));

export type ContactFormParsed = {
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  companyId: string;
  status: ContactStatus;
};

export type ContactFormValidationResult =
  | { ok: true; data: ContactFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function parseContactForm(formData: FormData): ContactFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const firstNameRaw = parseOptionalTrimmed(formData, "firstName") ?? "";
  if (!firstNameRaw) fieldErrors.firstName = "First name is required.";
  const firstName = firstNameRaw;

  const lastName = parseOptionalTrimmed(formData, "lastName");

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
  const title = parseOptionalTrimmed(formData, "title");

  const companyId = parseOptionalTrimmed(formData, "companyId") ?? "";
  if (!companyId) fieldErrors.companyId = "Company is required.";

  const statusRaw = parseOptionalTrimmed(formData, "status") ?? "";
  if (!statusRaw || !STATUS_SET.has(statusRaw)) {
    fieldErrors.status = "Select a valid status.";
  }

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
      title,
      companyId,
      status: statusRaw as ContactStatus,
    },
  };
}

