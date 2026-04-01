import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

import { getProposalByIdForUi } from "@/lib/proposals/queries";

import { ProposalDocumentPreview } from "@/app/(app)/proposals/_components/proposal-document-preview";

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

  const preparedByDisplay =
    session.user.name?.trim() || session.user.email || "Zuperio";

  return (
    <div className="bg-white px-6 py-8 print:px-0 print:py-0">
      <ProposalDocumentPreview
        proposal={proposal}
        preparedByDisplay={preparedByDisplay}
        hidePrintHint
      />
    </div>
  );
}
