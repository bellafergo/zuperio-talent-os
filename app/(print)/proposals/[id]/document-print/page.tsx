import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getComparisonMatrixForPair } from "@/lib/matching/queries";
import { getProposalByIdForUi } from "@/lib/proposals/queries";

import { ProposalConsultingPdfDocument } from "@/lib/proposals/pdf-template/proposal-consulting-pdf-document";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDocumentPrintPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const proposal = await getProposalByIdForUi(id);
  if (!proposal) notFound();

  const [comparisonMatrix, primaryContact, accountOwner] = await Promise.all([
    proposal.candidateId && proposal.vacancyId
      ? getComparisonMatrixForPair(proposal.candidateId, proposal.vacancyId).catch(() => null)
      : Promise.resolve(null),

    // Primary active contact for the company (most recently updated)
    prisma.contact
      .findFirst({
        where: { companyId: proposal.companyId, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        select: { firstName: true, lastName: true, title: true },
      })
      .catch(() => null),

    // Account owner: opportunity.owner → company.owner → null (falls back to session)
    (async () => {
      try {
        if (proposal.opportunityId) {
          const opp = await prisma.opportunity.findUnique({
            where: { id: proposal.opportunityId },
            select: { owner: { select: { name: true, email: true, role: true } } },
          });
          if (opp?.owner) return opp.owner;
        }
        const company = await prisma.company.findUnique({
          where: { id: proposal.companyId },
          select: { owner: { select: { name: true, email: true, role: true } } },
        });
        return company?.owner ?? null;
      } catch {
        return null;
      }
    })(),
  ]);

  const preparedByDisplay =
    session.user.name?.trim() || session.user.email || "Zuperio";

  const contactForPdf = primaryContact
    ? {
        name: `${primaryContact.firstName} ${primaryContact.lastName ?? ""}`.trim(),
        title: primaryContact.title?.trim() || null,
      }
    : null;

  const ownerForPdf = accountOwner?.name?.trim()
    ? {
        name: accountOwner.name.trim(),
        role: accountOwner.role,
        email: accountOwner.email,
      }
    : null;

  return (
    <div className="bg-white px-6 py-8 print:px-0 print:py-0">
      <ProposalConsultingPdfDocument
        proposal={proposal}
        preparedByDisplay={preparedByDisplay}
        comparisonMatrix={comparisonMatrix}
        primaryContact={contactForPdf}
        accountOwner={ownerForPdf}
      />
    </div>
  );
}
