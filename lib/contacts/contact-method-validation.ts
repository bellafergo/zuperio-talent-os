import {
  ContactMethodType as TypeConst,
  type ContactMethodType,
} from "@/generated/prisma/enums";

const TYPE_SET = new Set<string>(Object.values(TypeConst));

export type AddContactMethodParsed = {
  contactId: string;
  type: ContactMethodType;
  value: string;
  label: string | null;
  notes: string | null;
  makePrimary: boolean;
};

export type AddContactMethodResult =
  | { ok: true; data: AddContactMethodParsed }
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

export function parseAddContactMethodForm(
  formData: FormData,
): AddContactMethodResult {
  const fieldErrors: Record<string, string> = {};

  const contactId = parseOptionalTrimmed(formData, "contactId") ?? "";
  if (!contactId) fieldErrors.contactId = "Falta el contacto.";

  const typeRaw = parseOptionalTrimmed(formData, "type") ?? "";
  if (!typeRaw || !TYPE_SET.has(typeRaw)) {
    fieldErrors.type = "Selecciona un tipo válido.";
  }

  const valueRaw = parseOptionalTrimmed(formData, "value") ?? "";
  if (!valueRaw) fieldErrors.value = "El valor es obligatorio.";
  else if (valueRaw.length > 500) fieldErrors.value = "Máximo 500 caracteres.";

  if (typeRaw === "EMAIL" && valueRaw && !looksLikeEmail(valueRaw)) {
    fieldErrors.value = "Introduce un correo válido.";
  }

  const label = parseOptionalTrimmed(formData, "label");
  if (label && label.length > 120) fieldErrors.label = "Máximo 120 caracteres.";

  const notes = parseOptionalTrimmed(formData, "notes");
  if (notes && notes.length > 2000) fieldErrors.notes = "Máximo 2000 caracteres.";

  const makePrimary = formData.get("makePrimary") === "on" || formData.get("makePrimary") === "true";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      contactId,
      type: typeRaw as ContactMethodType,
      value: typeRaw === "EMAIL" ? valueRaw.toLowerCase() : valueRaw,
      label,
      notes,
      makePrimary,
    },
  };
}
