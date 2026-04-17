import { prisma } from "@/lib/prisma";
import { renderUrlToPdfBuffer } from "@/lib/pdf/render-url-to-pdf";

import { candidateCvPdfFilename } from "./cv-filename";

export async function generateCandidateCvPdfPackage(params: {
  candidateId: string;
  cookieHeader: string;
  origin: string;
}): Promise<{ buffer: Buffer; filename: string }> {
  const c = await prisma.candidate.findUnique({
    where: { id: params.candidateId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!c) {
    throw new Error("NOT_FOUND");
  }

  const printUrl = `${params.origin}/candidates/${params.candidateId}/cv-print`;
  const buffer = await renderUrlToPdfBuffer({
    printPageUrl: printUrl,
    cookieHeader: params.cookieHeader,
  });

  await prisma.candidate.update({
    where: { id: params.candidateId },
    data: { candidateCvExportedAt: new Date() },
  });

  return {
    buffer,
    filename: candidateCvPdfFilename(c.firstName, c.lastName),
  };
}
