import { Prisma } from "@/generated/prisma/client";

/**
 * User-facing, production-safe hint; full detail stays in server logs.
 */
export function mapProposalPersistError(
  err: unknown,
  kind: "create" | "update" = "create",
): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      return "No se pudo guardar: una referencia no existe en la base de datos (empresa, vacante, candidato o usuario). Revisa el formulario o sincroniza datos.";
    }
    if (err.code === "P2002") {
      return "No se pudo guardar: conflicto de unicidad. Revisa duplicados o vuelve a intentar.";
    }
    if (err.code === "P2022") {
      return "Base de datos desalineada con el esquema (columna faltante). Ejecuta migraciones y `npx prisma generate`.";
    }
    return `Error al guardar (${err.code}). Revisa logs del servidor o migraciones.`;
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return "Los datos no coinciden con el esquema de la base de datos. Revisa el formulario o ejecuta `npx prisma generate`.";
  }
  return kind === "update"
    ? "No se pudo actualizar la propuesta. Intenta de nuevo."
    : "No se pudo crear la propuesta. Intenta de nuevo.";
}
