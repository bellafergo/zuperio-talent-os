import {
  UserRole as RoleConst,
  type UserRole,
} from "@/generated/prisma/enums";

const ROLE_SET = new Set<string>(Object.values(RoleConst));

function parseTrimmed(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export type CreateAdminUserParsed = {
  name: string | null;
  email: string;
  role: UserRole;
  password: string;
};

export function parseCreateAdminUserForm(
  formData: FormData,
):
  | { ok: true; data: CreateAdminUserParsed }
  | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const nameRaw = parseTrimmed(formData, "name");
  const name = nameRaw ? nameRaw.slice(0, 200) : null;

  const emailRaw = parseTrimmed(formData, "email").toLowerCase();
  if (!emailRaw) fieldErrors.email = "El correo es obligatorio.";
  else if (!looksLikeEmail(emailRaw)) fieldErrors.email = "Introduce un correo válido.";

  const roleRaw = parseTrimmed(formData, "role");
  if (!roleRaw || !ROLE_SET.has(roleRaw)) {
    fieldErrors.role = "Selecciona un rol válido.";
  }

  const password = parseTrimmed(formData, "password");
  if (!password) fieldErrors.password = "La contraseña temporal es obligatoria.";
  else if (password.length < 8) {
    fieldErrors.password = "Mínimo 8 caracteres.";
  } else if (password.length > 128) {
    fieldErrors.password = "Máximo 128 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      name,
      email: emailRaw,
      role: roleRaw as UserRole,
      password,
    },
  };
}

export type UpdateAdminUserParsed = {
  userId: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export function parseUpdateAdminUserForm(
  formData: FormData,
):
  | { ok: true; data: UpdateAdminUserParsed }
  | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const userId = parseTrimmed(formData, "userId");
  if (!userId) fieldErrors.userId = "Falta el usuario.";

  const nameRaw = parseTrimmed(formData, "name");
  const name = nameRaw ? nameRaw.slice(0, 200) : null;

  const emailRaw = parseTrimmed(formData, "email").toLowerCase();
  if (!emailRaw) fieldErrors.email = "El correo es obligatorio.";
  else if (!looksLikeEmail(emailRaw)) fieldErrors.email = "Introduce un correo válido.";

  const roleRaw = parseTrimmed(formData, "role");
  if (!roleRaw || !ROLE_SET.has(roleRaw)) {
    fieldErrors.role = "Selecciona un rol válido.";
  }

  const isActive =
    formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      userId,
      name,
      email: emailRaw,
      role: roleRaw as UserRole,
      isActive,
    },
  };
}
