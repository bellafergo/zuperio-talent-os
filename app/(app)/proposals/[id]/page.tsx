import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader, SectionCard } from "@/components/layout";
import {
  canManageProposals,
  canSendProposalClientEmail,
} from "@/lib/auth/proposal-access";
import { getComparisonMatrixForPair } from "@/lib/matching/queries";
import { buildProposalEmailDraft } from "@/lib/proposals/email-draft";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listVacanciesForProposalForm,
  getCompanyPreferredContactForProposalEmail,
  getProposalByIdForUi,
} from "@/lib/proposals/queries";

import { ProposalCommercialTracking } from "../_components/proposal-commercial-tracking";
import { ProposalDetailTabs } from "../_components/proposal-detail-tabs";
import { ProposalDocumentPreview } from "../_components/proposal-document-preview";
import { ProposalEditDialog } from "../_components/proposal-edit-dialog";
import { ProposalStatusBadge } from "../_components/proposal-status-badge";
import { ProposalEmailDraftPanel } from "../_components/proposal-email-draft-panel";
import { ProposalCvDownloadButton } from "../_components/proposal-cv-download-button";
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
  const canSendEmail = canSendProposalClientEmail(session?.user?.role);

  const proposal = await getProposalByIdForUi(id);
  if (!proposal) notFound();

  const hasCandidate = proposal.candidateId != null;

  const [companies, opportunities, vacancies, candidates, contact, comparisonMatrix] =
    await Promise.all([
      canManage ? listCompaniesForProposalForm() : Promise.resolve([]),
      canManage ? listOpportunitiesForProposalForm() : Promise.resolve([]),
      canManage ? listVacanciesForProposalForm() : Promise.resolve([]),
      canManage ? listCandidatesForProposalForm() : Promise.resolve([]),
      getCompanyPreferredContactForProposalEmail(proposal.companyId),
      proposal.candidateId && proposal.vacancyId
        ? getComparisonMatrixForPair(proposal.candidateId, proposal.vacancyId)
        : Promise.resolve(null),
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
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        eyebrow="Client proposal"
        backHref="/proposals"
        backLabel="Back to proposals"
        title={proposal.companyName}
        description="Deterministic pricing, PDF-ready document, structured candidate fit, and commercial tracking — built for delivery and review."
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ProposalStatusBadge label={proposal.status} value={proposal.statusValue} />
            <span
              className="hidden h-4 w-px bg-border sm:block"
              aria-hidden
            />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{proposal.currency}</span>
              {" · "}
              valid {proposal.validityDays}d · {proposal.format}
            </span>
          </div>
        }
        actions={
          canManage ? (
            <ProposalEditDialog
              proposal={proposal}
              companies={companies}
              opportunities={opportunities}
              vacancies={vacancies}
              candidates={candidates}
            />
          ) : null
        }
      />

      <ProposalCommercialTracking
        proposalId={proposal.id}
        canManage={canManage}
        statusValue={proposal.statusValue}
        isFollowUpPending={proposal.isFollowUpPending}
        sentAtLabel={proposal.sentAtLabel}
        lastFollowUpAtLabel={proposal.lastFollowUpAtLabel}
        followUpCount={proposal.followUpCount}
      />

      <ProposalDetailTabs
        overview={
          <ProposalOverviewPanel
            proposal={proposal}
            comparisonMatrix={comparisonMatrix}
          />
        }
        pricing={<ProposalPricingPanel proposal={proposal} />}
        preview={
          <div className="space-y-6">
            <SectionCard
              title="Exports"
              description="Download PDF and candidate CV for client delivery."
            >
              <div className="flex flex-wrap gap-3">
                <ProposalPdfDownloadButton proposalId={proposal.id} />
                {proposal.candidateId ? (
                  <ProposalCvDownloadButton candidateId={proposal.candidateId} />
                ) : null}
              </div>
            </SectionCard>
            <ProposalDocumentPreview
              proposal={proposal}
              preparedByDisplay={preparedByDisplay}
            />
          </div>
        }
        emailDraft={
          <ProposalEmailDraftPanel
            draft={emailDraft}
            proposalId={proposal.id}
            canSendEmail={canSendEmail}
            hasCandidate={hasCandidate}
          />
        }
      />
    </div>
  );
}
