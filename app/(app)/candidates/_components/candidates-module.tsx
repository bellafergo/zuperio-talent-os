"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ProposalsNewProposalDialog } from "@/app/(app)/proposals/_components/proposals-new-proposal-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionalClientSectionBoundary } from "@/components/optional-client-section-boundary";
import { loadCandidateEditDataForListAction } from "@/lib/candidates/actions";
import { filterCandidates } from "@/lib/candidates/filter-candidates";
import {
  buildProposalProfileSummaryForListRow,
  reviveCandidateEditDataFromJson,
} from "@/lib/candidates/list-row-helpers";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { CandidateFilterState, CandidateUi } from "@/lib/candidates/types";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";
import type { SkillOption } from "@/lib/skills/queries";
import type { OpenVacancyOptionForCandidateForm } from "@/lib/vacancies/queries";

import { CandidateEditDialog } from "./candidate-edit-dialog";
import { CandidatesDataTable } from "./candidates-data-table";
import { CandidatesEmptyState } from "./candidates-empty-state";
import { CandidatesToolbar } from "./candidates-toolbar";

const defaultFilters: CandidateFilterState = {
  query: "",
  seniority: "all",
  availabilityStatus: "all",
  pipelineIntent: "all",
  linkedVacancy: "all",
};

export function CandidatesModule({
  candidates,
  canManage = false,
  canProposals = false,
  skillsCatalog = [],
  openVacancies = [],
  proposalCompanies = [],
  proposalOpportunities = [],
  proposalVacancies = [],
  proposalCandidates = [],
}: {
  candidates: CandidateUi[];
  canManage?: boolean;
  canProposals?: boolean;
  skillsCatalog?: SkillOption[];
  openVacancies?: OpenVacancyOptionForCandidateForm[];
  proposalCompanies?: ProposalCompanyOption[];
  proposalOpportunities?: ProposalOpportunityOption[];
  proposalVacancies?: ProposalVacancyOption[];
  proposalCandidates?: ProposalCandidateOption[];
}) {
  const [filters, setFilters] = useState<CandidateFilterState>(defaultFilters);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalTarget, setProposalTarget] = useState<CandidateUi | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<CandidateEditData | null>(null);
  const [listActionError, setListActionError] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [, startListTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(
    () => filterCandidates(candidates, filters),
    [candidates, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = candidates.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;
  const showRowActions = canManage || canProposals;

  function openProposalForRow(row: CandidateUi) {
    setListActionError(null);
    setProposalTarget(row);
    setProposalOpen(true);
  }

  function goToCvSection(row: CandidateUi) {
    setListActionError(null);
    router.push(`/candidates/${row.id}#candidate-section-cv`);
  }

  function openEditForRow(row: CandidateUi) {
    setListActionError(null);
    setPendingEditId(row.id);
    startListTransition(async () => {
      const result = await loadCandidateEditDataForListAction(row.id);
      setPendingEditId(null);
      if (result.ok) {
        setEditData(reviveCandidateEditDataFromJson(result.data));
        setEditOpen(true);
      } else {
        setListActionError(result.message ?? "No se pudo abrir el editor.");
      }
    });
  }

  const proposalPartial =
    proposalTarget != null
      ? {
          candidateId: proposalTarget.id,
          profileSummary: buildProposalProfileSummaryForListRow(proposalTarget),
        }
      : undefined;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CandidatesToolbar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Banco de talento</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {catalogEmpty ? (
            <div className="pt-6">
              <CandidatesEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <CandidatesEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <OptionalClientSectionBoundary
              fallback={
                <p className="pt-6 text-sm text-muted-foreground">
                  No se pudo cargar la tabla de candidatos.
                </p>
              }
            >
              {listActionError ? (
                <p className="pt-4 text-sm text-destructive" role="alert">
                  {listActionError}
                </p>
              ) : null}
              {canProposals ? (
                <ProposalsNewProposalDialog
                  headless
                  open={proposalOpen}
                  onOpenChange={(next) => {
                    setProposalOpen(next);
                    if (!next) setProposalTarget(null);
                  }}
                  companies={proposalCompanies}
                  opportunities={proposalOpportunities}
                  vacancies={proposalVacancies}
                  candidates={proposalCandidates}
                  formDefaultsPartial={proposalPartial}
                />
              ) : null}
              {canManage && editData ? (
                <CandidateEditDialog
                  key={editData.id}
                  candidate={editData}
                  skillsCatalog={skillsCatalog}
                  openVacancies={openVacancies}
                  hideDefaultTrigger
                  open={editOpen}
                  onOpenChange={(next) => {
                    setEditOpen(next);
                    if (!next) setEditData(null);
                  }}
                />
              ) : null}
              <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
                <CandidatesDataTable
                  candidates={filtered}
                  rowActions={
                    showRowActions
                      ? {
                          canManage,
                          canProposals,
                          pendingEditId,
                          onProposal: openProposalForRow,
                          onEdit: openEditForRow,
                          onCv: goToCvSection,
                        }
                      : undefined
                  }
                />
              </div>
            </OptionalClientSectionBoundary>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
