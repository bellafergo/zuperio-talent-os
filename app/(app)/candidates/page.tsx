import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { listCandidatesForUi } from "@/lib/candidates/queries";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listVacanciesForProposalForm,
} from "@/lib/proposals/queries";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";
import { listSkillsForVacancyForm } from "@/lib/skills/queries";
import type { SkillOption } from "@/lib/skills/queries";
import {
  listOpenVacanciesForCandidateForm,
  type OpenVacancyOptionForCandidateForm,
} from "@/lib/vacancies/queries";

import { CandidatesHeader } from "./_components/candidates-header";
import { CandidatesModule } from "./_components/candidates-module";

export const dynamic = "force-dynamic";

async function safeCandidatesListSecondaryFetch<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error(`[candidates/list] ${label} failed`, err);
    return fallback;
  }
}

export default async function CandidatesPage() {
  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const canProposals = canManageProposals(session?.user?.role);
  const [
    candidates,
    skillsCatalog,
    openVacancies,
    proposalCompanies,
    proposalOpportunities,
    proposalVacancies,
    proposalCandidates,
  ] = await Promise.all([
    listCandidatesForUi(),
    canManage
      ? safeCandidatesListSecondaryFetch(
          "listSkillsForVacancyForm",
          listSkillsForVacancyForm(),
          [] as SkillOption[],
        )
      : Promise.resolve([] as SkillOption[]),
    canManage
      ? safeCandidatesListSecondaryFetch(
          "listOpenVacanciesForCandidateForm",
          listOpenVacanciesForCandidateForm(),
          [] as OpenVacancyOptionForCandidateForm[],
        )
      : Promise.resolve([] as OpenVacancyOptionForCandidateForm[]),
    canProposals
      ? safeCandidatesListSecondaryFetch(
          "listCompaniesForProposalForm",
          listCompaniesForProposalForm(),
          [] as ProposalCompanyOption[],
        )
      : Promise.resolve([] as ProposalCompanyOption[]),
    canProposals
      ? safeCandidatesListSecondaryFetch(
          "listOpportunitiesForProposalForm",
          listOpportunitiesForProposalForm(),
          [] as ProposalOpportunityOption[],
        )
      : Promise.resolve([] as ProposalOpportunityOption[]),
    canProposals
      ? safeCandidatesListSecondaryFetch(
          "listVacanciesForProposalForm",
          listVacanciesForProposalForm(),
          [] as ProposalVacancyOption[],
        )
      : Promise.resolve([] as ProposalVacancyOption[]),
    canProposals
      ? safeCandidatesListSecondaryFetch(
          "listCandidatesForProposalForm",
          listCandidatesForProposalForm(),
          [] as ProposalCandidateOption[],
        )
      : Promise.resolve([] as ProposalCandidateOption[]),
  ]);

  return (
    <div className="space-y-8">
      <CandidatesHeader
        canManage={canManage}
        skillsCatalog={skillsCatalog}
        openVacancies={openVacancies}
      />
      <CandidatesModule
        candidates={candidates}
        canManage={canManage}
        canProposals={canProposals}
        skillsCatalog={skillsCatalog}
        openVacancies={openVacancies}
        proposalCompanies={proposalCompanies}
        proposalOpportunities={proposalOpportunities}
        proposalVacancies={proposalVacancies}
        proposalCandidates={proposalCandidates}
      />
    </div>
  );
}
