import { slugPart } from "@/lib/proposals/pdf-filename";

export function candidateCvPdfFilename(firstName: string, lastName: string): string {
  const a = slugPart(firstName, 20);
  const b = slugPart(lastName, 24);
  return `Zuperio-CV-${b}-${a}.pdf`;
}
