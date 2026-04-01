import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { buildProposalEmailDraft } from "@/lib/proposals/email-draft";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listVacanciesForProposalForm,
  getCompanyPreferredContactForProposalEmail,
  getProposalByIdForUi,
} from "@/lib/proposals/queries";

import { ProposalDetailTabs } from "../_components/proposal-detail-tabs";
import { ProposalDocumentPreview } from "../_components/proposal-document-preview";
import { ProposalEditDialog } from "../_components/proposal-edit-dialog";
import { ProposalEmailDraftPanel } from "../_components/proposal-email-draft-panel";
import { ProposalPdfDownloadButton } from "../_components/proposal-pdf-download-button";
import {
  ProposalOverviewPanel,
  ProposalPricingPanel,
} from "../_components/proposal-tab-panels";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageProposals(session?.user?.role);

  const proposal = await getProposalByIdForUi(id);
  if (!proposal) notFound();

  const [companies, opportunities, vacancies, candidates, contact] =
    await Promise.all([
      canManage ? listCompaniesForProposalForm() : Promise.resolve([]),
      canManage ? listOpportunitiesForProposalForm() : Promise.resolve([]),
      canManage ? listVacanciesForProposalForm() : Promise.resolve([]),
      canManage ? listCandidatesForProposalForm() : Promise.resolve([]),
      getCompanyPreferredContactForProposalEmail(proposal.companyId),
    ]);

  const preparedByDisplay =
    session?.user?.name?.trim() ||
    session?.user?.email ||
    "Zuperio";

  const emailDraft = buildProposalEmailDraft(proposal, {
    preparedByDisplay,
    recipientDisplayName: contact?.displayName ?? null,
    recipientEmail: contact?.email ?? null,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/proposals"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to proposals
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Proposal · {proposal.companyName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {proposal.status} · {proposal.currency} · valid {proposal.validityDays}
              d · {proposal.format}
            </p>
          </div>
          {canManage ? (
            <ProposalEditDialog
              proposal={proposal}
              companies={companies}
              opportunities={opportunities}
              vacancies={vacancies}
              candidates={candidates}
            />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Template-based proposal · deterministic pricing · preview ready for PDF
        </p>
      </div>

      <ProposalDetailTabs
        overview={<ProposalOverviewPanel proposal={proposal} />}
        pricing={<ProposalPricingPanel proposal={proposal} />}
        preview={
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5">
              <ProposalPdfDownloadButton proposalId={proposal.id} />
            </div>
            <ProposalDocumentPreview
              proposal={proposal}
              preparedByDisplay={preparedByDisplay}
            />
          </div>
        }
        emailDraft={<ProposalEmailDraftPanel draft={emailDraft} />}
      />
    </div>
  );
}
