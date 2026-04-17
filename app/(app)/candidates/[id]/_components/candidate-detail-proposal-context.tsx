"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ProposalsNewProposalDialog } from "@/app/(app)/proposals/_components/proposals-new-proposal-dialog";
import type { ProposalFormDefaults } from "@/app/(app)/proposals/_components/proposal-record-form-fields";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";

type OpenProposalFn = () => void;

const CandidateOpenProposalContext = createContext<OpenProposalFn | null>(null);

export function useCandidateOpenProposalDialog(): OpenProposalFn {
  const fn = useContext(CandidateOpenProposalContext);
  return fn ?? (() => {});
}

export function CandidateDetailProposalProvider({
  canProposals,
  companies,
  opportunities,
  vacancies,
  candidates,
  formDefaultsPartial,
  children,
}: {
  canProposals: boolean;
  companies: ProposalCompanyOption[];
  opportunities: ProposalOpportunityOption[];
  vacancies: ProposalVacancyOption[];
  candidates: ProposalCandidateOption[];
  formDefaultsPartial?: Partial<ProposalFormDefaults>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openProposal = useCallback(() => {
    if (canProposals) setOpen(true);
  }, [canProposals]);
  const value = useMemo(() => openProposal, [openProposal]);

  return (
    <CandidateOpenProposalContext.Provider value={value}>
      {canProposals ? (
        <ProposalsNewProposalDialog
          headless
          open={open}
          onOpenChange={setOpen}
          companies={companies}
          opportunities={opportunities}
          vacancies={vacancies}
          candidates={candidates}
          formDefaultsPartial={formDefaultsPartial}
        />
      ) : null}
      {children}
    </CandidateOpenProposalContext.Provider>
  );
}
