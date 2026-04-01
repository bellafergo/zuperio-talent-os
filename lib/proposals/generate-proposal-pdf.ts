import { prisma } from "@/lib/prisma";
import { renderUrlToPdfBuffer } from "@/lib/pdf/render-url-to-pdf";

import { proposalEconomicPdfFilename } from "./pdf-filename";
import { getProposalByIdForUi } from "./queries";

export async function generateProposalPdfPackage(params: {
  proposalId: string;
  cookieHeader: string;
  origin: string;
}): Promise<{ buffer: Buffer; filename: string }> {
  const proposal = await getProposalByIdForUi(params.proposalId);
  if (!proposal) {
    throw new Error("NOT_FOUND");
  }

  const printUrl = `${params.origin}/proposals/${params.proposalId}/document-print`;
  const buffer = await renderUrlToPdfBuffer({
    printPageUrl: printUrl,
    cookieHeader: params.cookieHeader,
  });

  await prisma.proposal.update({
    where: { id: params.proposalId },
    data: { proposalPdfExportedAt: new Date() },
  });

  return {
    buffer,
    filename: proposalEconomicPdfFilename(proposal),
  };
}
