import {
  CompanyStatus as CompanyStatusConst,
  type CompanyStatus,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(CompanyStatusConst));

export type CompanyFormParsed = {
  name: string;
  industry: string | null;
  location: string | null;
  status: CompanyStatus;
  ownerId: string | null;
};

export type CompanyFormValidationResult =
  | { ok: true; data: CompanyFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

export function parseCompanyForm(formData: FormData): CompanyFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const nameRaw = formData.get("name");
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    fieldErrors.name = "Name is required.";
  }

  const industryRaw = formData.get("industry");
  const industry =
    typeof industryRaw === "string" && industryRaw.trim()
      ? industryRaw.trim()
      : null;

  const locationRaw = formData.get("location");
  const location =
    typeof locationRaw === "string" && locationRaw.trim()
      ? locationRaw.trim()
      : null;

  const statusRaw = formData.get("status");
  const statusStr = typeof statusRaw === "string" ? statusRaw.trim() : "";
  if (!statusStr || !STATUS_SET.has(statusStr)) {
    fieldErrors.status = "Select a valid status.";
  }

  const ownerRaw = formData.get("ownerId");
  let ownerId: string | null = null;
  if (typeof ownerRaw === "string" && ownerRaw.trim()) {
    ownerId = ownerRaw.trim();
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      name,
      industry,
      location,
      status: statusStr as CompanyFormParsed["status"],
      ownerId,
    },
  };
}
