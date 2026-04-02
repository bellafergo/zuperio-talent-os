import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/layout";
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
import { ProposalConsultingPdfDocument } from "@/lib/proposals/pdf-template/proposal-consulting-pdf-document";
import { ProposalEditDialog } from "../_components/proposal-edit-dialog";
import { ProposalStatusBadge } from "../_components/proposal-status-badge";
import { ProposalEmailDraftPanel } from "../_components/proposal-email-draft-panel";
import { ProposalExportsSection } from "../_components/proposal-exports-section";
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

  const identityParts: string[] = [];
  if (proposal.candidateName.trim() && proposal.candidateName !== "—") {
    identityParts.push(`Candidato: ${proposal.candidateName}`);
  }
  if (proposal.opportunityTitle.trim() && proposal.opportunityTitle !== "—") {
    identityParts.push(`Oportunidad: ${proposal.opportunityTitle}`);
  }
  if (proposal.vacancyTitle.trim() && proposal.vacancyTitle !== "—") {
    identityParts.push(`Vacante: ${proposal.vacancyTitle}`);
  }
  const identityLine = identityParts.join(" · ");
  const detailDescription = identityLine
    ? `${identityLine}. Precios deterministas, documento listo para PDF, encaje del candidato y seguimiento comercial.`
    : "Precios deterministas, documento listo para PDF, encaje del candidato y seguimiento comercial.";

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        eyebrow="Detalle de propuesta"
        backHref="/proposals"
        backLabel="Volver a propuestas"
        title={proposal.companyName}
        description={detailDescription}
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
              vigencia {proposal.validityDays}d · {proposal.format}
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
            <ProposalExportsSection proposal={proposal} />
            <div className="rounded-xl border border-border/80 bg-white p-6 shadow-sm ring-1 ring-foreground/[0.04]">
              <ProposalConsultingPdfDocument
                proposal={proposal}
                preparedByDisplay={preparedByDisplay}
                comparisonMatrix={comparisonMatrix}
                variant="screen"
              />
            </div>
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
